import { Router } from "express";
import { getAnalytics } from "../controllers/analytics.controller.js";
import { verifyJWT } from "../utils/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAnalytics);

export default router;
