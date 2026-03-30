import { Router } from "express";
import { verifyJWT } from "../utils/auth.middleware.js";
import {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  getSystemStats,
  getAllProjects,
  getSystemLogs,
  getGlobalSettings,
  updateGlobalSettings
} from "../controllers/admin.controller.js";

const router = Router();

// Middleware to check for Admin role
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
};

router.use(verifyJWT, isAdmin);

router.get("/users", getAllUsers);
router.patch("/users/status", updateUserStatus);
router.patch("/users/role", updateUserRole);
router.get("/projects", getAllProjects);
router.get("/stats", getSystemStats);
router.get("/logs", getSystemLogs);
router.get("/settings", getGlobalSettings);
router.put("/settings", updateGlobalSettings);

export default router;

