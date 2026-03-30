import { Message } from "../models/message.model.js";

const populateMsg = (q) =>
  q.populate("sender", "username email avatar").sort({ createdAt: 1 });

export const getProjectMessages = async (req, res) => {
  const messages = await populateMsg(Message.find({ project: req.params.projectId, deletedAt: null }));
  res.status(200).json({ messages });
};

export const getTaskMessages = async (req, res) => {
  const messages = await populateMsg(Message.find({ task: req.params.taskId, deletedAt: null }));
  res.status(200).json({ messages });
};

export const deleteMessage = async (req, res) => {
  const msg = await Message.findById(req.params.messageId);
  if (!msg) return res.status(404).json({ message: "Message not found" });
  if (msg.sender.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Not authorised" });
  msg.deletedAt = new Date();
  await msg.save();
  res.status(200).json({ message: "Message deleted" });
};
