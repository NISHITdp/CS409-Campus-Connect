import express from "express";
import { getEvents, createEvent, rsvpEvent } from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getEvents).post(protect, createEvent);
router.post("/:id/rsvp", protect, rsvpEvent);

export default router;
