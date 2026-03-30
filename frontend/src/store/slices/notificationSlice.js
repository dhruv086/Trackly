import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/notifications');
    return response.data.notifications;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

export const markAsReadAsync = createAsyncThunk('notifications/markAsRead', async (notificationId, { rejectWithValue }) => {
  try {
    const response = await API.patch(`/notifications/${notificationId}/read`);
    return response.data.notification;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

export const markAllAsReadAsync = createAsyncThunk('notifications/markAllAsRead', async (_, { rejectWithValue }) => {
  try {
    await API.patch('/notifications/mark-all');
    return true;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    loading: false,
    unreadCount: 0,
  },
  reducers: {
    // Called by the socket listener when a new notification arrives in real-time
    pushNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
      })
      .addCase(markAsReadAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.unreadCount = state.items.filter(n => !n.isRead).length;
      })
      .addCase(markAllAsReadAsync.fulfilled, (state) => {
        state.items.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      });
  },
});

export const { pushNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
