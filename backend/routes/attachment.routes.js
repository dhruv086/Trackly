import { Router } from "express";
import multer from "multer";
import path from "path";
import { verifyJWT } from "../utils/auth.middleware.js";
import {
  uploadProjectAttachment, getProjectAttachments,
  deleteProjectAttachment, markProjectAttachmentViewed,
  uploadTaskAttachment, getTaskAttachments,
  deleteTaskAttachment, markTaskAttachmentViewed,
  serveAttachment,
} from "../controllers/attachment.controller.js";

// ─── Multer — disk storage, all types, no size limit ──────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // relative to backend root
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({ storage }); // no limits, all file types

const router = Router();
router.use(verifyJWT);

// Serve a file (inline) — no auth check needed beyond JWT
router.get("/file/:attachmentId", serveAttachment);

// ── Project attachments ──────────────────────────────────────────────────────
router.get("/project/:projectId",                       getProjectAttachments);
router.post("/project/:projectId", upload.single("file"), uploadProjectAttachment);
router.delete("/project/:projectId/:attachmentId",      deleteProjectAttachment);
router.patch("/project/:projectId/:attachmentId/view",  markProjectAttachmentViewed);

// ── Task attachments ─────────────────────────────────────────────────────────
router.get("/task/:taskId",                             getTaskAttachments);
router.post("/task/:taskId", upload.single("file"),     uploadTaskAttachment);
router.delete("/task/:taskId/:attachmentId",            deleteTaskAttachment);
router.patch("/task/:taskId/:attachmentId/view",        markTaskAttachmentViewed);

export default router;
