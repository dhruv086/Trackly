import { Router } from "express";
import { verifyJWT } from "../utils/auth.middleware.js";
import { getProjectMessages, getTaskMessages, deleteMessage } from "../controllers/chat.controller.js";

const router = Router();
router.use(verifyJWT);

router.get("/project/:projectId", getProjectMessages);
router.get("/task/:taskId",       getTaskMessages);
router.delete("/:messageId",      deleteMessage);

export default router;
