import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/projects');
    return response.data.projects;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

export const fetchProjectById = createAsyncThunk('projects/fetchProjectById', async (projectId, { rejectWithValue }) => {
  try {
    const response = await API.get(`/projects/${projectId}`);
    return response.data.project;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

export const createProjectAsync = createAsyncThunk('projects/createProject', async (projectData, { rejectWithValue }) => {
  try {
    const response = await API.post('/projects', projectData);
    return response.data.project;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const updateProjectAsync = createAsyncThunk('projects/updateProject', async ({ projectId, ...data }, { rejectWithValue }) => {
  try {
    const response = await API.patch(`/projects/${projectId}`, data);
    return response.data.project;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const deleteProjectAsync = createAsyncThunk('projects/deleteProject', async (projectId, { rejectWithValue }) => {
  try {
    await API.delete(`/projects/${projectId}`);
    return projectId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    items: [],
    currentProject: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(createProjectAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateProjectAsync.fulfilled, (state, action) => {
        const idx = state.items.findIndex(p => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentProject?._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(deleteProjectAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p._id !== action.payload);
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null;
        }
      });
  },
});

export const { clearCurrentProject } = projectSlice.actions;

export default projectSlice.reducer;
