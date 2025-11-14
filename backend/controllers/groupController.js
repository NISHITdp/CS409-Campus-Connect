import Group from "../models/Group.js";

export const getGroups = async (req, res) => {
  const groups = await Group.find().populate("createdBy", "name");
  res.json(groups);
};

export const createGroup = async (req, res) => {
  const { name, description } = req.body;
  const group = await Group.create({
    name,
    description,
    createdBy: req.user._id,
    members: [req.user._id],
  });
  res.status(201).json(group);
};
