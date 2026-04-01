import express from "express";
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import connectDB from "./db/db.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { User } from "./models/user.model.js";
import { Message } from "./models/message.model.js";
import { Notification } from "./models/notification.model.js";
import { Project } from "./models/project.model.js";
import { Task } from "./models/task.model.js";

dotenv.config({ path: "./.env" });

const app = express();
const httpServer = createServer(app);

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((o) => o.trim());

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));

// Uploads
fs.mkdirSync("uploads", { recursive: true });
app.use("/uploads", express.static(path.resolve("uploads")));

app.use(cookieParser());
app.use(morgan("dev"));

// ─── HTTP Routes ──────────────────────────────────────────────────────────────
import authRouter        from "./routes/auth.routes.js";
import projectRouter     from "./routes/project.routes.js";
import taskRouter        from "./routes/task.routes.js";
import teamRouter        from "./routes/team.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import analyticsRouter   from "./routes/analytics.routes.js";
import adminRouter       from "./routes/admin.routes.js";
import attachmentRouter  from "./routes/attachment.routes.js";
import chatRouter        from "./routes/chat.routes.js";
import aiRouter          from "./routes/ai.routes.js";

app.use("/api/v1/auth",          authRouter);
app.use("/api/v1/projects",      projectRouter);
app.use("/api/v1/tasks",         taskRouter);
app.use("/api/v1/team",          teamRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/analytics",     analyticsRouter);
app.use("/api/v1/admin",         adminRouter);
app.use("/api/v1/attachments",   attachmentRouter);
app.use("/api/v1/chat",          chatRouter);
app.use("/api/v1/ai",            aiRouter);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new SocketIO(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Expose io to controllers via app.locals
app.locals.io = io;

// Auth middleware for socket connections
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");
    if (!token) return next(new Error("Unauthorised"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).select("-password -refreshToken");
    if (!user) return next(new Error("User not found"));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// Online users map: { userId -> Set<socketId> }
const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.user._id.toString();
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socket.id);

  console.log(`[Socket] ${socket.user.username} connected (${socket.id})`);

  // ── Join rooms ──────────────────────────────────────────────────────────────

  // Join a project chat room
  socket.on("join:project", (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`[Socket] ${socket.user.username} joined project room ${projectId}`);
  });

  // Join a task chat room
  socket.on("join:task", (taskId) => {
    socket.join(`task:${taskId}`);
    console.log(`[Socket] ${socket.user.username} joined task room ${taskId}`);
  });

  // Leave rooms
  socket.on("leave:project", (projectId) => socket.leave(`project:${projectId}`));
  socket.on("leave:task",    (taskId)    => socket.leave(`task:${taskId}`));

  // ── Project chat message ────────────────────────────────────────────────────
  socket.on("chat:project", async ({ projectId, text }) => {
    if (!text?.trim()) return;
    try {
      const msg = await Message.create({
        sender:  socket.user._id,
        project: projectId,
        text:    text.trim(),
      });
      const populated = await msg.populate("sender", "username email avatar");

      // Broadcast to everyone in the room (including sender)
      io.to(`project:${projectId}`).emit("chat:project:message", populated);

      // Notify all project members who are NOT the sender
      const project = await Project.findById(projectId).select("members name");
      if (project) {
        const recipients = project.members
          .map((m) => m.toString())
          .filter((id) => id !== userId);

        if (recipients.length > 0) {
          const notifications = recipients.map((recipientId) => ({
            recipient: recipientId,
            sender:    socket.user._id,
            type:      "comment",
            title:     "New Project Message",
            message:   `${socket.user.username} sent a message in ${project.name}`,
            project:   projectId,
          }));
          const created = await Notification.insertMany(notifications);
          // Push real-time notification to each online recipient (never to sender)
          recipients.forEach((recipientId, i) => {
            if (recipientId === userId) return; // extra guard: never notify sender
            if (onlineUsers.has(recipientId)) {
              onlineUsers.get(recipientId).forEach((sid) => {
                io.to(sid).emit("notification:new", created[i]);
              });
            }
          });
        }
      }
    } catch (err) {
      console.error("[Socket] chat:project error:", err.message);
    }
  });

  // ── Task chat message ───────────────────────────────────────────────────────
  socket.on("chat:task", async ({ taskId, text }) => {
    if (!text?.trim()) return;
    try {
      const msg = await Message.create({
        sender: socket.user._id,
        task:   taskId,
        text:   text.trim(),
      });
      const populated = await msg.populate("sender", "username email avatar");
      io.to(`task:${taskId}`).emit("chat:task:message", populated);

      // Notify task assignees who are not the sender
      const task = await Task.findById(taskId).populate("project", "name").select("title assignees project");
      if (task) {
        const recipients = (task.assignees || [])
          .map((a) => a.toString())
          .filter((id) => id !== userId);

        if (recipients.length > 0) {
          const notifications = recipients.map((recipientId) => ({
            recipient: recipientId,
            sender:    socket.user._id,
            type:      "comment",
            title:     "New Task Message",
            message:   `${socket.user.username} commented on task: ${task.title}`,
            project:   task.project?._id,
            task:      taskId,
          }));
          const created = await Notification.insertMany(notifications);
          // Push real-time notification (never to sender)
          recipients.forEach((recipientId, i) => {
            if (recipientId === userId) return; // extra guard
            if (onlineUsers.has(recipientId)) {
              onlineUsers.get(recipientId).forEach((sid) => {
                io.to(sid).emit("notification:new", created[i]);
              });
            }
          });
        }
      }
    } catch (err) {
      console.error("[Socket] chat:task error:", err.message);
    }
  });

  // ── Typing indicators ───────────────────────────────────────────────────────
  socket.on("typing:project", ({ projectId, isTyping }) => {
    socket.to(`project:${projectId}`).emit("typing:project", {
      userId,
      username: socket.user.username,
      isTyping,
    });
  });

  socket.on("typing:task", ({ taskId, isTyping }) => {
    socket.to(`task:${taskId}`).emit("typing:task", {
      userId,
      username: socket.user.username,
      isTyping,
    });
  });

  // ── Disconnect ──────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const sockets = onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (!sockets.size) onlineUsers.delete(userId);
    }
    console.log(`[Socket] ${socket.user.username} disconnected`);
  });
});

// ─── Helper: send a real-time notification to a specific user ─────────────────
// Used by other controllers via app.locals.notifyUser
app.locals.notifyUser = async (recipientId, notificationData) => {
  try {
    const notif = await Notification.create(notificationData);
    const rid = recipientId.toString();
    if (onlineUsers.has(rid)) {
      onlineUsers.get(rid).forEach((sid) => io.to(sid).emit("notification:new", notif));
    }
    return notif;
  } catch (_) {}
};

// ─── Helper: broadcast an event to all members of a project room ──────────────
app.locals.emitToProject = (projectId, event, data) => {
  io.to(`project:${projectId}`).emit(event, data);
};

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});