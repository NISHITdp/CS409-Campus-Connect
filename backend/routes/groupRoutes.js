// backend/routes/groupRoutes.js
import express from "express";
import Group from "../models/Group.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/groups  -> list all groups
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find().populate("members", "name email");
    res.json(groups);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/groups  -> create a group (protected)
router.post("/", protect, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Name and description required" });
    }

    const group = await Group.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json(group);
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/join", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findByIdAndUpdate(
      id,
      { $addToSet: { members: req.user._id } }, // avoids duplicates
      { new: true }
    ).populate("members", "name email");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    return res.json(group);
  } catch (err) {
    console.error("Error joining group:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/join", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const already = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (already) return res.status(200).json({ message: "Already a member" });

    group.members.push(req.user._id);
    await group.save();

    // return updated group (populated for nicer UI)
    const updated = await Group.findById(group._id).populate("members", "name email");
    res.json(updated);
  } catch (err) {
    console.error("Join group error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/leave", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.members = group.members.filter(
      (m) => m.toString() !== req.user._id.toString()
    );
    await group.save();
    const updated = await Group.findById(group._id).populate("members", "name email");
    res.json(updated);
  } catch (err) {
    console.error("Leave group error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
