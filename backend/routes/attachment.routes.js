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

import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../utils/cloudinary.js";

// ─── Multer — Cloudinary storage ──────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "trackly/attachments",
    resource_type: "auto", // accept all file types (images, pdfs, etc)
    public_id: (req, file) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      return unique;
    },
  },
});

const upload = multer({ storage });

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
