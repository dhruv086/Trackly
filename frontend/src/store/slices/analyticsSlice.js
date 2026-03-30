import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchAnalytics = createAsyncThunk('analytics/fetchAnalytics', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/analytics');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
  }
});

const initialState = {
  metrics: {
    totalProjects: 0,
    activeProjects: 0,
    recentDeadlines: 0,
    issues: 0
  },
  distributionData: [],
  weeklyData: [],
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload.metrics;
        state.distributionData = action.payload.distributionData;
        state.weeklyData = action.payload.weeklyData;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default analyticsSlice.reducer;
