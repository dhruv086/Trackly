import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchAllUsers = createAsyncThunk('admin/fetchAllUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/admin/users');
    return response.data.users;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Failed to fetch users');
  }
});

export const fetchAllProjects = createAsyncThunk('admin/fetchAllProjects', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/admin/projects');
    return response.data.projects;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Failed to fetch projects');
  }
});

export const fetchAdminStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/admin/stats');
    return response.data.stats;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Failed to fetch stats');
  }
});

export const fetchAdminLogs = createAsyncThunk('admin/fetchLogs', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/admin/logs');
    return response.data.logs;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Failed to fetch logs');
  }
});

export const fetchGlobalSettings = createAsyncThunk('admin/fetchSettings', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/admin/settings');
    return response.data.settings;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Failed to fetch settings');
  }
});

export const updateUserRoleThunk = createAsyncThunk('admin/updateRole', async ({ userId, role }, { rejectWithValue }) => {
  try {
    const response = await API.patch('/admin/users/role', { userId, role });
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Failed to update role');
  }
});

export const updateGlobalSettingsThunk = createAsyncThunk('admin/updateSettings', async (settings, { rejectWithValue }) => {
  try {
    const response = await API.put('/admin/settings', settings);
    return response.data.settings;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    projects: [],
    logs: [],
    settings: {},
    stats: {
      totalUsers: 0,
      totalProjects: 0,
      totalTasks: 0,
      activeProjects: 0
    },
    loading: false,
    saving: false,
    error: null
  },
  reducers: {
    updateSettingLocally: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllProjects.fulfilled, (state, action) => {
        state.projects = action.payload;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchAdminLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
      })
      .addCase(fetchGlobalSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(updateUserRoleThunk.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateGlobalSettingsThunk.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateGlobalSettingsThunk.fulfilled, (state, action) => {
        state.saving = false;
        state.settings = action.payload;
      })
      .addCase(updateGlobalSettingsThunk.rejected, (state) => {
        state.saving = false;
      });
  }
});

export const { updateSettingLocally } = adminSlice.actions;

export default adminSlice.reducer;
