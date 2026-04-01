import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchMembers = createAsyncThunk('team/fetchMembers', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/team');
    return response.data.members;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

export const fetchAIEvaluation = createAsyncThunk('team/fetchAIEvaluation', async (userId, { rejectWithValue }) => {
  try {
    const response = await API.get(`/ai/evaluate-user/${userId}`);
    return response.data.evaluation;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

export const inviteMemberAsync = createAsyncThunk('team/inviteMember', async (memberData, { rejectWithValue }) => {
  try {
    const response = await API.post('/team/invite', memberData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

export const addMemberToProjectAsync = createAsyncThunk('team/addMember', async ({ projectId, userId }, { rejectWithValue }) => {
  try {
    const response = await API.post(`/projects/${projectId}/members`, { userId });
    return response.data.project;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

export const removeMemberFromProjectAsync = createAsyncThunk('team/removeMember', async ({ projectId, userId }, { rejectWithValue }) => {
  try {
    const response = await API.delete(`/projects/${projectId}/members/${userId}`);
    return response.data.project;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

const initialState = {
  members: [],
  projectMembers: [],
  invitations: [],
  loading: false,
  aiEvaluation: null,
  aiEvaluationLoading: false,
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setProjectMembers: (state, action) => {
      state.projectMembers = action.payload || [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload || [];
      })
      .addCase(inviteMemberAsync.fulfilled, (state, action) => {
        state.invitations.push(action.payload.invitation);
      })
      .addCase(addMemberToProjectAsync.fulfilled, (state, action) => {
        state.projectMembers = action.payload.members || [];
      })
      .addCase(removeMemberFromProjectAsync.fulfilled, (state, action) => {
        state.projectMembers = action.payload.members || [];
      })
      .addCase(fetchAIEvaluation.pending, (state) => {
        state.aiEvaluationLoading = true;
        state.aiEvaluation = null;
      })
      .addCase(fetchAIEvaluation.fulfilled, (state, action) => {
        state.aiEvaluationLoading = false;
        state.aiEvaluation = action.payload;
      })
      .addCase(fetchAIEvaluation.rejected, (state) => {
        state.aiEvaluationLoading = false;
        state.aiEvaluation = null;
      });
  }
});

export const { setProjectMembers } = teamSlice.actions;

export default teamSlice.reducer;
