import { Router } from "express";
import { verifyJWT } from "../utils/auth.middleware.js";
import { evaluateUserProductivity } from "../controllers/ai.controller.js";

const router = Router();

router.route("/evaluate-user/:id").get(verifyJWT, evaluateUserProductivity);

export default router;
