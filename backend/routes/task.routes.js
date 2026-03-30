import { Router } from "express";
import {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getAssignedTasks,
  getAllTasks
} from "../controllers/task.controller.js";
import { verifyJWT } from "../utils/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createTask);
router.route("/all").get(getAllTasks);
router.route("/assigned-to-me").get(getAssignedTasks);
router.route("/project/:projectId").get(getProjectTasks);
router.route("/:taskId/status").patch(updateTaskStatus);
router.route("/:taskId").patch(updateTask).delete(deleteTask);

export default router;
