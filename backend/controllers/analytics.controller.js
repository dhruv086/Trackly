import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Basic Metrics
    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    });

    const projectIds = projects.map(p => p._id);
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === "Active").length;

    const allTasks = await Task.find({ project: { $in: projectIds } });

    // Recent Deadlines: Tasks due in the next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const recentDeadlines = allTasks.filter(t =>
      t.dueDate && new Date(t.dueDate) >= new Date() && new Date(t.dueDate) <= nextWeek
    ).length;

    // Issues: Tasks in "Review" status or can be defined otherwise
    const issues = allTasks.filter(t => t.status === "Review").length;

    // 2. Task Distribution
    const distribution = {
      Done: 0,
      "In Progress": 0,
      "To Do": 0,
      Review: 0
    };

    allTasks.forEach(task => {
      if (distribution[task.status] !== undefined) {
        distribution[task.status]++;
      }
    });

    const totalTasks = allTasks.length || 1;
    const distributionData = [
      { name: 'Completed', value: Math.round((distribution['Done'] / totalTasks) * 100), color: '#4f46e5' },
      { name: 'In Progress', value: Math.round((distribution['In Progress'] / totalTasks) * 100), color: '#10b981' },
      { name: 'To Do', value: Math.round((distribution['To Do'] / totalTasks) * 100), color: '#f59e0b' },
      { name: 'Review', value: Math.round((distribution['Review'] / totalTasks) * 100), color: '#ef4444' },
    ];

    // 3. Productivity Trend (Last 7 Days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      last7Days.push({
        date: d,
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: 0,
        pending: 0
      });
    }

    allTasks.forEach(task => {
      const taskDate = new Date(task.updatedAt);
      taskDate.setHours(0, 0, 0, 0);

      const dayIndex = last7Days.findIndex(d => d.date.getTime() === taskDate.getTime());
      if (dayIndex !== -1) {
        if (task.status === "Done") {
          last7Days[dayIndex].completed++;
        } else {
          last7Days[dayIndex].pending++;
        }
      }
    });

    // Cleanup date objects before sending
    const weeklyData = last7Days.map(({ name, completed, pending }) => ({ name, completed, pending }));

    return res.status(200).json({
      metrics: {
        totalProjects,
        activeProjects,
        recentDeadlines,
        issues
      },
      distributionData,
      weeklyData,
      message: "Analytics fetched successfully"
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return res.status(500).json({ message: "Failed to fetch analytics" });
  }
};
