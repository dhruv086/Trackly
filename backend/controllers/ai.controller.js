import { GoogleGenAI } from "@google/genai";
import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getAIErrorStatus = (error) => {
  if (!error) return undefined;

  const statusCandidates = [
    error.status,
    error?.response?.status,
    error.code,
    error?.error?.code,
    error?.error?.status,
  ];

  for (const status of statusCandidates) {
    if (status === 429 || status === 503 || status === 504) return status;
    if (typeof status === "string" && status.toUpperCase() === "UNAVAILABLE") return 503;
  }
  return undefined;
};

const isRetryableAIError = (error) => {
  const status = getAIErrorStatus(error);
  return status === 429 || status === 503 || status === 504;
};

const generateAIContentWithRetry = async (payload, maxRetries = 2) => {
  let attempt = 0;
  let lastError;

  while (attempt <= maxRetries) {
    try {
      return await ai.models.generateContent(payload);
    } catch (error) {
      lastError = error;
      if (attempt >= maxRetries || !isRetryableAIError(error)) {
        throw error;
      }
      const delay = 1000 * Math.pow(2, attempt);
      console.warn(`AI request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying after ${delay}ms...`, error.message || error);
      await sleep(delay);
      attempt += 1;
    }
  }
  throw lastError;
};

export const evaluateUserProductivity = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const requestingUser = req.user;

    // Optional Check: Ensure requestingUser is Admin (already handled by router middleware, but safety check)
    if (requestingUser.role !== "Admin") {
      return res.status(403).json({ message: "Only Admins can generate AI reports." });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check Cache logic (generate at most once every 24 hours to prevent limits, or if it doesn't exist)
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    if (
      targetUser.aiEvaluation &&
      targetUser.aiEvaluation.lastEvaluatedAt &&
      (Date.now() - new Date(targetUser.aiEvaluation.lastEvaluatedAt).getTime()) < ONE_DAY_MS
    ) {
      return res.status(200).json({
        message: "Loaded from cache",
        evaluation: targetUser.aiEvaluation,
      });
    }

    // Fetch User's Tasks
    const userTasks = await Task.find({ assignees: targetUserId });

    const totalTasks = userTasks.length;
    const completedTasksList = userTasks.filter((t) => t.status === "Done");
    const completedTasks = completedTasksList.length;
    const inProgressTasks = userTasks.filter((t) => t.status === "In Progress").length;
    const completedOnOrBeforeDeadline = completedTasksList.filter((task) => {
      return task.dueDate && new Date(task.updatedAt) <= new Date(task.dueDate);
    }).length;
    const completedLate = completedTasksList.filter((task) => {
      return task.dueDate && new Date(task.updatedAt) > new Date(task.dueDate);
    }).length;
    const deadlineAwareTasks = completedTasksList.filter((task) => task.dueDate).length;
    const averageDeadlineDeltaDays = deadlineAwareTasks
      ? (completedTasksList
          .filter((task) => task.dueDate)
          .reduce((sum, task) => {
            return sum + ((new Date(task.updatedAt) - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
          }, 0) / deadlineAwareTasks)
          .toFixed(1)
      : 0;
    
    let highPriorityCompleted = 0;
    let highPriorityTotal = 0;

    userTasks.forEach(task => {
        if (task.priority === "High") {
            highPriorityTotal++;
            if (task.status === "Done") highPriorityCompleted++;
        }
    });

    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0;

    // Create the AI Prompt
    const prompt = `
      You are an expert HR and Productivity Analyst for a tech company.
      I need you to analyze an employee named ${targetUser.username}.
      
      Here is their task completion record:
      - Total Tasks Assigned: ${totalTasks}
      - Tasks Completed (Done): ${completedTasks} (${completionRate}%)
      - Tasks In Progress: ${inProgressTasks}
      - High Priority Tasks: ${highPriorityCompleted} completed out of ${highPriorityTotal} total assigned.
      - Tasks Completed On or Before Deadline: ${completedOnOrBeforeDeadline}
      - Tasks Completed Late: ${completedLate}
      - Average Deadline Delta (days): ${averageDeadlineDeltaDays} (negative means early, positive means late)
      
      Based on this statistical data, please provide a JSON response containing:
      1. "productivityScore": A number from 0 to 100 evaluating their overall performance. (If total tasks is 0, give a score of 0 or N/A logic mapped into the score).
      2. "workStyle": A 1-2 word label summarizing their working style (e.g., "Meticulous", "Procrastinator", "Balanced", "High Output").
      3. "incrementImpact": A short string recommending what to do with their salary/promotion (e.g. "Eligible for +5% increment", "Needs review", "Standard +2%").
      4. "summary": A 2-3 sentence paragraph explaining your reasoning specifically aimed at their manager/admin. Explain WHY based on the numbers provided.
      5. "deadlineEvaluation": A short sentence describing whether this user is consistently meeting deadlines, finishing early, or missing due dates.
      
      Use the deadline statistics to reward early completion and penalize repeated late delivery. Return ONLY valid JSON.
    `;

    // Attempt to parse AI if key is present
    if (!process.env.GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY provided. Returning mock data.");
      const mockEval = {
        productivityScore: 85,
        workStyle: "Simulated Worker",
        incrementImpact: "Mock +3%",
        summary: "This is a mocked response because no API key is set. The user has decent numbers but this is just a placeholder.",
        lastEvaluatedAt: new Date(),
      };
      
      targetUser.aiEvaluation = mockEval;
      await targetUser.save();
      
      return res.status(200).json({
        message: "Mock data generated successfully",
        evaluation: targetUser.aiEvaluation
      });
    }

    // Call Gemini Model
    const response = await generateAIContentWithRetry({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const aiResData = JSON.parse(response.text);

    targetUser.aiEvaluation = {
      productivityScore: aiResData.productivityScore || 0,
      workStyle: aiResData.workStyle || "Unknown",
      incrementImpact: aiResData.incrementImpact || "N/A",
      summary: aiResData.summary || "No summary provided.",
      deadlineEvaluation: aiResData.deadlineEvaluation || "No deadline analysis provided.",
      lastEvaluatedAt: new Date(),
    };

    await targetUser.save();

    return res.status(200).json({
      message: "AI evaluation generated successfully",
      evaluation: targetUser.aiEvaluation,
    });
  } catch (error) {
    const status = getAIErrorStatus(error);
    if (status === 503 || status === 504) {
      console.error("AI_EVALUATION_ERROR (service unavailable):", error);
      return res.status(503).json({ message: "AI service is currently unavailable. Please try again later." });
    }
    console.error("AI_EVALUATION_ERROR:", error);
    return res.status(500).json({ message: error.message || "Failed to generate AI evaluation" });
  }
};
