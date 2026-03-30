import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const fetchProjectAttachments = createAsyncThunk(
  'attachments/fetchProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/attachments/project/${projectId}`);
      return { projectId, attachments: res.data.attachments };
    } catch (e) { return rejectWithValue(e.response?.data?.message); }
  }
);

export const uploadProjectAttachment = createAsyncThunk(
  'attachments/uploadProject',
  async ({ projectId, file }, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await API.post(`/attachments/project/${projectId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { projectId, attachment: res.data.attachment };
    } catch (e) { return rejectWithValue(e.response?.data?.message); }
  }
);

export const deleteProjectAttachment = createAsyncThunk(
  'attachments/deleteProject',
  async ({ projectId, attachmentId }, { rejectWithValue }) => {
    try {
      await API.delete(`/attachments/project/${projectId}/${attachmentId}`);
      return { projectId, attachmentId };
    } catch (e) { return rejectWithValue(e.response?.data?.message); }
  }
);

export const markProjectAttachmentViewed = createAsyncThunk(
  'attachments/viewProject',
  async ({ projectId, attachmentId }, { rejectWithValue }) => {
    try {
      const res = await API.patch(`/attachments/project/${projectId}/${attachmentId}/view`);
      return { projectId, attachment: res.data.attachment };
    } catch (e) { return rejectWithValue(e.response?.data?.message); }
  }
);

export const fetchTaskAttachments = createAsyncThunk(
  'attachments/fetchTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/attachments/task/${taskId}`);
      return { taskId, attachments: res.data.attachments };
    } catch (e) { return rejectWithValue(e.response?.data?.message); }
  }
);

export const uploadTaskAttachment = createAsyncThunk(
  'attachments/uploadTask',
  async ({ taskId, file }, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await API.post(`/attachments/task/${taskId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { taskId, attachment: res.data.attachment };
    } catch (e) { return rejectWithValue(e.response?.data?.message); }
  }
);

export const deleteTaskAttachment = createAsyncThunk(
  'attachments/deleteTask',
  async ({ taskId, attachmentId }, { rejectWithValue }) => {
    try {
      await API.delete(`/attachments/task/${taskId}/${attachmentId}`);
      return { taskId, attachmentId };
    } catch (e) { return rejectWithValue(e.response?.data?.message); }
  }
);

export const markTaskAttachmentViewed = createAsyncThunk(
  'attachments/viewTask',
  async ({ taskId, attachmentId }, { rejectWithValue }) => {
    try {
      const res = await API.patch(`/attachments/task/${taskId}/${attachmentId}/view`);
      return { taskId, attachment: res.data.attachment };
    } catch (e) { return rejectWithValue(e.response?.data?.message); }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const attachmentSlice = createSlice({
  name: 'attachments',
  initialState: {
    byProject: {},   // { [projectId]: Attachment[] }
    byTask:    {},   // { [taskId]:    Attachment[] }
    loading:   false,
    uploading: false,
    error:     null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // ── helpers ──────────────────────────────────────────────────────────────
    const uploaded = (list, attachment) => [attachment, ...list.filter(a => a._id !== attachment._id)];
    const removed  = (list, id)         => list.filter(a => a._id !== id);
    const updated  = (list, attachment) => list.map(a => a._id === attachment._id ? attachment : a);

    builder
      // project fetch
      .addCase(fetchProjectAttachments.pending,  (s) => { s.loading = true; })
      .addCase(fetchProjectAttachments.fulfilled, (s, { payload: { projectId, attachments } }) => {
        s.loading = false;
        s.byProject[projectId] = attachments;
      })
      // project upload
      .addCase(uploadProjectAttachment.pending,  (s) => { s.uploading = true; })
      .addCase(uploadProjectAttachment.fulfilled, (s, { payload: { projectId, attachment } }) => {
        s.uploading = false;
        s.byProject[projectId] = uploaded(s.byProject[projectId] || [], attachment);
      })
      .addCase(uploadProjectAttachment.rejected, (s) => { s.uploading = false; })
      // project delete
      .addCase(deleteProjectAttachment.fulfilled, (s, { payload: { projectId, attachmentId } }) => {
        if (s.byProject[projectId]) s.byProject[projectId] = removed(s.byProject[projectId], attachmentId);
      })
      // project view
      .addCase(markProjectAttachmentViewed.fulfilled, (s, { payload: { projectId, attachment } }) => {
        if (s.byProject[projectId]) s.byProject[projectId] = updated(s.byProject[projectId], attachment);
      })
      // task fetch
      .addCase(fetchTaskAttachments.pending,  (s) => { s.loading = true; })
      .addCase(fetchTaskAttachments.fulfilled, (s, { payload: { taskId, attachments } }) => {
        s.loading = false;
        s.byTask[taskId] = attachments;
      })
      // task upload
      .addCase(uploadTaskAttachment.pending,  (s) => { s.uploading = true; })
      .addCase(uploadTaskAttachment.fulfilled, (s, { payload: { taskId, attachment } }) => {
        s.uploading = false;
        s.byTask[taskId] = uploaded(s.byTask[taskId] || [], attachment);
      })
      .addCase(uploadTaskAttachment.rejected, (s) => { s.uploading = false; })
      // task delete
      .addCase(deleteTaskAttachment.fulfilled, (s, { payload: { taskId, attachmentId } }) => {
        if (s.byTask[taskId]) s.byTask[taskId] = removed(s.byTask[taskId], attachmentId);
      })
      // task view
      .addCase(markTaskAttachmentViewed.fulfilled, (s, { payload: { taskId, attachment } }) => {
        if (s.byTask[taskId]) s.byTask[taskId] = updated(s.byTask[taskId], attachment);
      });
  },
});

export default attachmentSlice.reducer;
