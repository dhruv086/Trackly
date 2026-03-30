import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './slices/taskSlice';
import teamReducer from './slices/teamSlice';
import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import notificationReducer from './slices/notificationSlice';
import analyticsReducer from './slices/analyticsSlice';
import adminReducer from './slices/adminSlice';
import attachmentReducer from './slices/attachmentSlice';

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    team: teamReducer,
    theme: themeReducer,
    auth: authReducer,
    projects: projectReducer,
    notifications: notificationReducer,
    analytics: analyticsReducer,
    admin: adminReducer,
    attachments: attachmentReducer,
  },
});
