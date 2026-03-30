import path from "path";
import fs from "fs";
import { Attachment } from "../models/attachment.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";

// ─── helpers ─────────────────────────────────────────────────────────────────

const populate = (q) =>
  q
    .populate("uploadedBy", "username email avatar")
    .populate("viewedBy.user", "username email avatar");

// ─── PROJECT ATTACHMENTS ─────────────────────────────────────────────────────

export const uploadProjectAttachment = async (req, res) => {
  const { projectId } = req.params;
  if (!req.file) return res.status(400).json({ message: "No file provided" });

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const attachment = await Attachment.create({
    filename:     req.file.filename,
    originalName: req.file.originalname,
    mimetype:     req.file.mimetype,
    size:         req.file.size,
    path:         req.file.path,
    uploadedBy:   req.user._id,
    project:      projectId,
  });

  const populated = await populate(Attachment.findById(attachment._id));

  // Notify all project members except the uploader
  const notifyUser = req.app.locals.notifyUser;
  const emitToProject = req.app.locals.emitToProject;
  if (notifyUser && project.members) {
    const others = project.members.filter((m) => m.toString() !== req.user._id.toString());
    for (const memberId of others) {
      await notifyUser(memberId, {
        recipient: memberId,
        sender:    req.user._id,
        type:      "assignment",
        title:     "New File Uploaded",
        message:   `${req.user.username} uploaded "${req.file.originalname}" in ${project.name}`,
        project:   projectId,
      });
    }
  }
  // Broadcast to project room so the file list updates in real-time
  if (emitToProject) emitToProject(projectId, "attachment:new", populated);

  res.status(201).json({ attachment: populated, message: "File uploaded successfully" });
};

export const getProjectAttachments = async (req, res) => {
  const { projectId } = req.params;
  const attachments = await populate(
    Attachment.find({ project: projectId }).sort({ createdAt: -1 })
  );
  res.status(200).json({ attachments, message: "Attachments fetched" });
};

export const deleteProjectAttachment = async (req, res) => {
  const { attachmentId } = req.params;
  const attachment = await Attachment.findById(attachmentId);
  if (!attachment) return res.status(404).json({ message: "Attachment not found" });

  // Only uploader or project owner can delete
  const project = await Project.findById(attachment.project);
  const isOwner = project?.owner?.toString() === req.user._id.toString();
  const isUploader = attachment.uploadedBy.toString() === req.user._id.toString();
  if (!isOwner && !isUploader)
    return res.status(403).json({ message: "Not authorised to delete this file" });

  // Remove from disk
  if (fs.existsSync(attachment.path)) fs.unlinkSync(attachment.path);
  await attachment.deleteOne();

  res.status(200).json({ message: "Attachment deleted" });
};

export const markProjectAttachmentViewed = async (req, res) => {
  const { attachmentId } = req.params;
  const attachment = await Attachment.findById(attachmentId);
  if (!attachment) return res.status(404).json({ message: "Attachment not found" });

  const alreadyViewed = attachment.viewedBy.some(
    (v) => v.user.toString() === req.user._id.toString()
  );

  if (!alreadyViewed) {
    attachment.viewedBy.push({ user: req.user._id, viewedAt: new Date() });
    await attachment.save();
  }

  const populated = await populate(Attachment.findById(attachment._id));
  res.status(200).json({ attachment: populated });
};

// ─── TASK ATTACHMENTS ────────────────────────────────────────────────────────

export const uploadTaskAttachment = async (req, res) => {
  const { taskId } = req.params;
  if (!req.file) return res.status(400).json({ message: "No file provided" });

  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  const attachment = await Attachment.create({
    filename:     req.file.filename,
    originalName: req.file.originalname,
    mimetype:     req.file.mimetype,
    size:         req.file.size,
    path:         req.file.path,
    uploadedBy:   req.user._id,
    task:         taskId,
  });

  const populated = await populate(Attachment.findById(attachment._id));
  res.status(201).json({ attachment: populated, message: "File uploaded successfully" });
};

export const getTaskAttachments = async (req, res) => {
  const { taskId } = req.params;
  const attachments = await populate(
    Attachment.find({ task: taskId }).sort({ createdAt: -1 })
  );
  res.status(200).json({ attachments, message: "Attachments fetched" });
};

export const deleteTaskAttachment = async (req, res) => {
  const { attachmentId } = req.params;
  const attachment = await Attachment.findById(attachmentId);
  if (!attachment) return res.status(404).json({ message: "Attachment not found" });

  const isUploader = attachment.uploadedBy.toString() === req.user._id.toString();
  if (!isUploader)
    return res.status(403).json({ message: "Not authorised to delete this file" });

  if (fs.existsSync(attachment.path)) fs.unlinkSync(attachment.path);
  await attachment.deleteOne();

  res.status(200).json({ message: "Attachment deleted" });
};

export const markTaskAttachmentViewed = async (req, res) => {
  const { attachmentId } = req.params;
  const attachment = await Attachment.findById(attachmentId);
  if (!attachment) return res.status(404).json({ message: "Attachment not found" });

  const task = await Task.findById(attachment.task);
  // Only assignees need to be tracked for tasks
  const isAssignee = task?.assignees?.some(
    (a) => a.toString() === req.user._id.toString()
  );

  const alreadyViewed = attachment.viewedBy.some(
    (v) => v.user.toString() === req.user._id.toString()
  );

  if (isAssignee && !alreadyViewed) {
    attachment.viewedBy.push({ user: req.user._id, viewedAt: new Date() });
    await attachment.save();
  }

  const populated = await populate(Attachment.findById(attachment._id));
  res.status(200).json({ attachment: populated });
};

// ─── SERVE FILE ──────────────────────────────────────────────────────────────

export const serveAttachment = async (req, res) => {
  const { attachmentId } = req.params;
  const attachment = await Attachment.findById(attachmentId);
  if (!attachment) return res.status(404).json({ message: "File not found" });

  const absPath = path.resolve(attachment.path);
  if (!fs.existsSync(absPath))
    return res.status(404).json({ message: "File missing from disk" });

  res.setHeader("Content-Disposition", `inline; filename="${attachment.originalName}"`);
  res.setHeader("Content-Type", attachment.mimetype);
  res.sendFile(absPath);
};
