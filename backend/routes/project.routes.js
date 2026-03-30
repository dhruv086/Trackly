import { Router } from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMemberToProject,
  removeMemberFromProject
} from "../controllers/project.controller.js";
import { verifyJWT } from "../utils/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createProject).get(getProjects);
router.route("/:projectId").get(getProjectById).patch(updateProject).delete(deleteProject);
router.route("/:projectId/members").post(addMemberToProject);
router.route("/:projectId/members/:userId").delete(removeMemberFromProject);

export default router;
