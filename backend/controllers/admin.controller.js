import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";

// In-memory global settings (resets on server restart; swap for a DB model for persistence)
let globalSettingsStore = {
  maintenanceMode: false,
  allowNewRegistrations: true,
  requireEmailVerification: false,
  maxProjectsPerUser: 10,
  systemEmail: "admin@projectly.app"
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken").sort({ createdAt: -1 });
    return res.status(200).json({ users, message: "All users fetched" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const user = await User.findByIdAndUpdate(userId, { status }, { new: true }).select("-password");
    return res.status(200).json({ user, message: `User status updated to ${status}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");
    return res.status(200).json({ user, message: `User role updated to ${role}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();

    // Last 30 days active users (simulated by login activity if we had a field, otherwise just count)
    const activeProjects = await Project.countDocuments({ status: "Active" });

    return res.status(200).json({
      stats: {
        totalUsers,
        totalProjects,
        totalTasks,
        activeProjects
      },
      message: "System stats fetched"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("owner", "username email")
      .populate("members", "username email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ projects, message: "All projects fetched" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSystemLogs = async (req, res) => {
  // In a real app, this would fetch from a logging DB or file
  const logs = [
    { id: 1, action: "User Login", user: "dhruv", timestamp: new Date(), status: "Success" },
    { id: 2, action: "Project Created", user: "admin", timestamp: new Date(Date.now() - 3600000), status: "Success" },
    { id: 3, action: "Task Deleted", user: "member_1", timestamp: new Date(Date.now() - 7200000), status: "Warning" },
    { id: 4, action: "Failed Login", user: "unknown", timestamp: new Date(Date.now() - 86400000), status: "Danger" },
  ];
  return res.status(200).json({ logs, message: "System logs fetched" });
};

export const getGlobalSettings = async (req, res) => {
  return res.status(200).json({ settings: globalSettingsStore, message: "Global settings fetched" });
};

export const updateGlobalSettings = async (req, res) => {
  try {
    const updates = req.body;
    // Merge updates into the store
    globalSettingsStore = { ...globalSettingsStore, ...updates };
    return res.status(200).json({ settings: globalSettingsStore, message: "Global settings updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
