import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { Notification } from "../models/notification.model.js";

/**
 * Recalculate a project's completion progress from its tasks and optionally
 * persist the updated value to the DB.
 * Returns the progress integer (0-100).
 */
async function computeAndSaveProgress(projectId, { save = false } = {}) {
  const [total, done] = await Promise.all([
    Task.countDocuments({ project: projectId }),
    Task.countDocuments({ project: projectId, columnId: 'done' }),
  ]);
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  if (save) {
    await Project.findByIdAndUpdate(projectId, { progress });
  }
  return progress;
}

export const createProject = async (req, res) => {
  const { name, description, status, deadline, additionalMembers } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Project name is required" });
  }

  // Merge owner + any extra members (deduplicated)
  const extraIds = Array.isArray(additionalMembers) ? additionalMembers : [];
  const memberSet = [...new Set([req.user._id.toString(), ...extraIds])];

  const created = await Project.create({
    name,
    description,
    status: status || "Active",
    deadline: deadline || undefined,
    owner: req.user._id,
    members: memberSet,
  });

  const project = await Project.findById(created._id).populate("owner members", "username email avatar");

  // Notify each additional member
  if (extraIds.length > 0) {
    const notifications = extraIds.map((userId) => ({
      recipient: userId,
      sender: req.user._id,
      type: "assignment",
      title: "Added to Project",
      message: `You have been added to the project "${name}"`,
      project: created._id,
    }));
    await Notification.insertMany(notifications);
  }

  return res.status(201).json({ project, message: "Project created successfully" });
};

export const getProjects = async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user._id }, { members: req.user._id }],
  }).populate("owner members", "username email avatar");

  // Compute real progress for each project from task counts
  const projectsWithProgress = await Promise.all(
    projects.map(async (p) => {
      const progress = await computeAndSaveProgress(p._id, { save: true });
      const obj = p.toObject();
      obj.progress = progress;
      return obj;
    })
  );

  return res.status(200).json({ projects: projectsWithProgress, message: "Projects fetched successfully" });
};

export const getProjectById = async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId).populate("owner members", "username email avatar");

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.status(200).json({ project, message: "Project fetched successfully" });
};

export const updateProject = async (req, res) => {
  const { projectId } = req.params;
  const { name, description, status, progress, deadline } = req.body;

  const before = await Project.findById(projectId).select("status name members");

  const project = await Project.findByIdAndUpdate(
    projectId,
    { name, description, status, progress, deadline },
    { new: true }
  ).populate("owner members", "username email avatar");

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  // Build notification message
  const statusChanged = status && before?.status !== status;
  const notifTitle   = statusChanged ? "Project Status Changed" : "Project Updated";
  const notifMessage = statusChanged
    ? `Project "${project.name}" status changed to "${status}"`
    : `Project "${project.name}" has been updated`;

  // Notify members (not the updater) and push real-time if possible
  const notifyUser    = req.app?.locals?.notifyUser;
  const emitToProject = req.app?.locals?.emitToProject;

  if (project.members && project.members.length > 0) {
    for (const member of project.members) {
      const memberId = member._id || member;
      if (memberId.toString() === req.user._id.toString()) continue;
      const notifData = {
        recipient: memberId,
        sender:    req.user._id,
        type:      "status_change",
        title:     notifTitle,
        message:   notifMessage,
        project:   project._id,
      };
      if (notifyUser) {
        await notifyUser(memberId, notifData);
      } else {
        await Notification.create(notifData);
      }
    }
  }

  // Broadcast project update to all open project tabs
  if (emitToProject) emitToProject(projectId, "project:updated", project);

  return res.status(200).json({ project, message: "Project updated successfully" });
};


export const deleteProject = async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  // Cascade: delete all tasks belonging to this project
  await Task.deleteMany({ project: projectId });

  return res.status(200).json({ message: "Project deleted successfully" });
};

export const addMemberToProject = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.body;

  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (project.members.includes(userId)) {
    return res.status(400).json({ message: "User is already a member of this project" });
  }

  project.members.push(userId);
  await project.save();

  const updatedProject = await Project.findById(projectId).populate("owner members", "username email avatar");

  // Notify the new member
  await Notification.create({
    recipient: userId,
    sender: req.user._id,
    type: "assignment",
    title: "Added to Project",
    message: `You have been added to the project "${project.name}"`,
    project: project._id
  });

  return res.status(200).json({ project: updatedProject, message: "Member added successfully" });
};

export const removeMemberFromProject = async (req, res) => {
  const { projectId, userId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  project.members = project.members.filter(id => id.toString() !== userId);
  await project.save();

  const updatedProject = await Project.findById(projectId).populate("owner members", "username email avatar");

  return res.status(200).json({ project: updatedProject, message: "Member removed successfully" });
};
