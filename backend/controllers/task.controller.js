import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import { Notification } from "../models/notification.model.js";

export const createTask = async (req, res) => {
  const { title, description, priority, status, dueDate, assignees, project, columnId } = req.body;

  if (!title || !project) {
    return res.status(400).json({ message: "Title and project are required" });
  }

  const task = await Task.create({
    title,
    description,
    priority,
    status,
    dueDate,
    assignees,
    project,
    columnId
  });

  if (!task) {
    throw new Error("Task creation failed");
  }

  // Create notifications for assignees
  if (assignees && assignees.length > 0) {
    const notifications = assignees.map(assigneeId => ({
      recipient: assigneeId,
      sender: req.user._id,
      type: "assignment",
      title: "New Task Assigned",
      message: `You have been assigned to: ${title}`,
      project: project,
      task: task._id
    }));
    await Notification.insertMany(notifications);
  }

  // Recalculate project progress (new task = denominator grows, so % may drop)
  const [totalTasks, doneTasks] = await Promise.all([
    Task.countDocuments({ project }),
    Task.countDocuments({ project, columnId: 'done' }),
  ]);
  await Project.findByIdAndUpdate(project, {
    progress: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
  });

  const populatedTask = await Task.findById(task._id)
    .populate('project', 'name')
    .populate('assignees', 'username email avatar');

  return res.status(201).json({ task: populatedTask, message: "Task created successfully" });
};

export const getProjectTasks = async (req, res) => {
  const { projectId } = req.params;

  const tasks = await Task.find({ project: projectId })
    .populate('project', 'name')
    .populate('assignees', 'username email avatar');

  return res.status(200).json({ tasks, message: "Tasks fetched successfully" });
};

export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const updateData = req.body;

  const task = await Task.findByIdAndUpdate(taskId, updateData, { new: true });

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  return res.status(200).json({ task, message: "Task updated successfully" });
};

export const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findByIdAndDelete(taskId);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  return res.status(200).json({ message: "Task deleted successfully" });
};

export const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status, columnId } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  task.status = status;
  task.columnId = columnId;
  await task.save();

  // Recalculate parent project's progress from task counts and persist it
  const [totalTasks, doneTasks] = await Promise.all([
    Task.countDocuments({ project: task.project }),
    Task.countDocuments({ project: task.project, columnId: 'done' }),
  ]);
  const newProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  await Project.findByIdAndUpdate(task.project, { progress: newProgress });

  // Notify assignees about status change (skip the person making the change)
  if (task.assignees && task.assignees.length > 0 && task.assignees[0].toString() !== req.user._id.toString()) {
    await Notification.create({
      recipient: task.assignees[0],
      sender: req.user._id,
      type: "status_change",
      title: "Task Status Updated",
      message: `Task "${task.title}" status changed to ${status}`,
      project: task.project,
      task: task._id
    });
  }

  const populatedTask = await Task.findById(task._id)
    .populate('project', 'name')
    .populate('assignees', 'username email avatar');

  return res.status(200).json({ task: populatedTask, message: "Task status updated successfully" });
};

export const getAssignedTasks = async (req, res) => {
  const tasks = await Task.find({ assignees: req.user._id }).populate("project", "name");
  return res.status(200).json({ tasks, message: "Assigned tasks fetched successfully" });
};

export const getAllTasks = async (req, res) => {
  try {
    // Find all projects where the user is an owner or member
    const userProjects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).select("_id");

    const projectIds = userProjects.map((p) => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate("project", "name")
      .populate("assignees", "username email avatar");

    return res.status(200).json({ tasks, message: "All tasks fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
};
