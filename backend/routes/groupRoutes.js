import express from "express";
import { getGroups, createGroup } from "../controllers/groupController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.route("/").get(getGroups).post(protect, createGroup);
export default router;
