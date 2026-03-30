import { Router } from "express";
import { registerUser, loginUser, logoutUser, getCurrentUser, updateAccountDetails, changeCurrentPassword, updateNotificationPreferences, uploadAvatarController } from "../controllers/auth.controller.js";
import { verifyJWT } from "../utils/auth.middleware.js";
import { uploadAvatar } from "../utils/upload.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/update-notifications").patch(verifyJWT, updateNotificationPreferences);
router.route("/upload-avatar").post(verifyJWT, uploadAvatar, uploadAvatarController);

export default router;

