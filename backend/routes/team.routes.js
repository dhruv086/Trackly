import { Router } from "express";
import { getAllMembers, searchMembers, inviteMember, findUserByEmail } from "../controllers/team.controller.js";
import { verifyJWT } from "../utils/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllMembers);
router.route("/invite").post(inviteMember);
router.route("/search").get(searchMembers);
router.route("/find-by-email").get(findUserByEmail);

export default router;
