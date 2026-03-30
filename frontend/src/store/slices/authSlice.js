import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';
import { connectSocket, disconnectSocket } from '../../utils/socket';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/login', credentials);
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/register', userData);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Registration failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await API.post('/auth/logout');
    localStorage.removeItem('accessToken');
    return null;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Logout failed');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/auth/me');
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Failed to fetch user');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, { rejectWithValue }) => {
  try {
    const response = await API.patch('/auth/update-account', userData);
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Profile update failed');
  }
});

export const changePassword = createAsyncThunk('auth/changePassword', async (passwords, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/change-password', passwords);
    return response.data.message;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Password change failed');
  }
});

export const updateNotificationPreferencesThunk = createAsyncThunk('auth/updateNotificationPreferences', async (preferences, { rejectWithValue }) => {
  try {
    const response = await API.patch('/auth/update-notifications', { preferences });
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Notification update failed');
  }
});

export const uploadAvatarThunk = createAsyncThunk('auth/uploadAvatar', async (formData, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Avatar upload failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        const token = localStorage.getItem('accessToken');
        if (token) connectSocket(token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        disconnectSocket();
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        const token = localStorage.getItem('accessToken');
        if (token) connectSocket(token);
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.user = null;
        localStorage.removeItem('accessToken');
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateNotificationPreferencesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateNotificationPreferencesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateNotificationPreferencesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadAvatarThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadAvatarThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(uploadAvatarThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
