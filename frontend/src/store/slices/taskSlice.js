import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (projectId, { rejectWithValue }) => {
  try {
    const response = await API.get(`/tasks/project/${projectId}`);
    return response.data.tasks;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

export const fetchAllTasks = createAsyncThunk('tasks/fetchAllTasks', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/tasks/all');
    return response.data.tasks;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

export const fetchAssignedTasks = createAsyncThunk('tasks/fetchAssignedTasks', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/tasks/assigned-to-me');
    return response.data.tasks;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

export const addTaskAsync = createAsyncThunk('tasks/addTask', async (taskData, { rejectWithValue }) => {
  try {
    const response = await API.post('/tasks', taskData);
    return response.data.task;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

export const updateTaskStatusAsync = createAsyncThunk('tasks/updateStatus', async ({ taskId, status, columnId }, { rejectWithValue }) => {
  try {
    const response = await API.patch(`/tasks/${taskId}/status`, { status, columnId });
    return response.data.task;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

const initialState = {
  tasks: {},
  assignedTasks: [],
  columns: {
    'todo': { id: 'todo', title: 'To Do', taskIds: [] },
    'inprogress': { id: 'inprogress', title: 'In Progress', taskIds: [] },
    'review': { id: 'review', title: 'Review', taskIds: [] },
    'done': { id: 'done', title: 'Done', taskIds: [] },
  },
  columnOrder: ['todo', 'inprogress', 'review', 'done'],
  selectedTaskId: null,
  loading: false,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    selectTask: (state, action) => {
      state.selectedTaskId = action.payload;
    },
    clearSelectedTask: (state) => {
      state.selectedTaskId = null;
    },
    // Used by drag-and-drop for instant visual feedback
    optimisticMove: (state, action) => {
      const { taskId, fromColId, toColId, toIndex } = action.payload;
      // Remove from source column
      if (state.columns[fromColId]) {
        state.columns[fromColId].taskIds = state.columns[fromColId].taskIds.filter(
          (id) => id !== taskId
        );
      }
      // Insert at destination index
      if (state.columns[toColId]) {
        state.columns[toColId].taskIds.splice(toIndex, 0, taskId);
      }
      // Update task's columnId in the tasks map
      if (state.tasks[taskId]) {
        state.tasks[taskId].columnId = toColId;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        const tasks = {};
        const columns = {
          'todo': { id: 'todo', title: 'To Do', taskIds: [] },
          'inprogress': { id: 'inprogress', title: 'In Progress', taskIds: [] },
          'review': { id: 'review', title: 'Review', taskIds: [] },
          'done': { id: 'done', title: 'Done', taskIds: [] },
        };

        action.payload.forEach(task => {
          tasks[task._id] = { ...task, id: task._id };
          const colId = task.columnId || 'todo';
          if (columns[colId]) {
            columns[colId].taskIds.push(task._id);
          }
        });

        state.tasks = tasks;
        state.columns = columns;
      })
      .addCase(fetchAllTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        const tasks = {};
        const columns = {
          'todo': { id: 'todo', title: 'To Do', taskIds: [] },
          'inprogress': { id: 'inprogress', title: 'In Progress', taskIds: [] },
          'review': { id: 'review', title: 'Review', taskIds: [] },
          'done': { id: 'done', title: 'Done', taskIds: [] },
        };

        action.payload.forEach(task => {
          tasks[task._id] = { ...task, id: task._id };
          const colId = task.columnId || 'todo';
          if (columns[colId]) {
            columns[colId].taskIds.push(task._id);
          }
        });

        state.tasks = tasks;
        state.columns = columns;
      })
      .addCase(addTaskAsync.fulfilled, (state, action) => {
        const task = action.payload;
        state.tasks[task._id] = { ...task, id: task._id };
        state.columns[task.columnId || 'todo'].taskIds.unshift(task._id);
      })
      .addCase(updateTaskStatusAsync.fulfilled, (state, action) => {
        const task = action.payload;
        const taskId = task._id;
        const newColId = task.columnId || 'todo';

        // Find which column currently holds this task
        const oldColId = Object.keys(state.columns).find((colId) =>
          state.columns[colId].taskIds.includes(taskId)
        );

        // Remove from old column
        if (oldColId && oldColId !== newColId) {
          state.columns[oldColId].taskIds = state.columns[oldColId].taskIds.filter(
            (id) => id !== taskId
          );
          // Add to new column (at start so it's visible immediately)
          if (state.columns[newColId]) {
            state.columns[newColId].taskIds.unshift(taskId);
          }
        }

        // Always update the task data itself
        state.tasks[taskId] = { ...task, id: taskId };
      })
      .addCase(fetchAssignedTasks.fulfilled, (state, action) => {
        state.assignedTasks = action.payload;
      });
  }
});

export const { selectTask, clearSelectedTask } = taskSlice.actions;
export default taskSlice.reducer;
