import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { Notification } from "../models/notification.model.js";

export const getAllMembers = async (req, res) => {
  const users = await User.find({}).select("-password -refreshToken");
  return res.status(200).json({ members: users, message: "Members fetched successfully" });
};

export const searchMembers = async (req, res) => {
  const { query } = req.query;
  const users = await User.find({
    $or: [
      { username: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ],
  }).select("-password -refreshToken");

  return res.status(200).json({ members: users, message: "Members found" });
};
export const inviteMember = async (req, res) => {
  const { email, role, projectId } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // Find the user by email
    const foundUser = await User.findOne({ email: email.toLowerCase().trim() }).select("-password -refreshToken");
    if (!foundUser) {
      return res.status(404).json({ message: "No user found with that email address" });
    }

    // If a projectId is supplied, add them directly to the project
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: "Project not found" });

      if (project.members.map(id => id.toString()).includes(foundUser._id.toString())) {
        return res.status(400).json({ message: "User is already a member of this project" });
      }

      project.members.push(foundUser._id);
      await project.save();

      const updatedProject = await Project.findById(projectId).populate("owner members", "username email avatar");

      // Notify the new member
      await Notification.create({
        recipient: foundUser._id,
        sender: req.user._id,
        type: "assignment",
        title: "Added to Project",
        message: `You have been added to the project "${project.name}"`,
        project: project._id
      });

      return res.status(200).json({
        user: foundUser,
        project: updatedProject,
        message: `${foundUser.username} has been added to the project`
      });
    }

    // No projectId — return the found user so the frontend can pick what to do
    return res.status(200).json({ user: foundUser, message: "User found" });
  } catch (error) {
    console.error("INVITE_ERROR:", error);
    return res.status(500).json({ message: "Failed to process invite" });
  }
};

export const findUserByEmail = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email query param is required" });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("-password -refreshToken");
    if (!user) return res.status(404).json({ message: "No user found with that email" });
    return res.status(200).json({ user, message: "User found" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to search user" });
  }
};
