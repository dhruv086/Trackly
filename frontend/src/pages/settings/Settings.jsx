import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../../store/slices/themeSlice';
import { updateProfile, changePassword, updateNotificationPreferencesThunk, clearError, uploadAvatarThunk } from '../../store/slices/authSlice';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  User,
  Lock,
  Bell,
  Palette,
  ShieldCheck,
  Camera,
  Mail,
  Globe,
  Check,
  Briefcase,
  Type
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const currentTheme = useSelector((state) => state.theme.mode);
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    jobTitle: ''
  });

  // Security Form State
  const [securityData, setSecurityData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification Form State
  const [notificationPrefs, setNotificationPrefs] = useState({
    assignments: true,
    comments: true,
    statusChanges: true,
    invites: true,
    reminders: true
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        jobTitle: user.jobTitle || ''
      });
      if (user.notificationPreferences) {
        setNotificationPrefs(user.notificationPreferences);
      }
      // Sync avatar preview with server value
      if (user.avatar) setAvatarPreview(null); // actual image served from backend
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      setMessage({ type: 'error', text: error });
      const timer = setTimeout(() => {
        dispatch(clearError());
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (name) => {
    setNotificationPrefs(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const saveProfile = async () => {
    const resultAction = await dispatch(updateProfile(profileData));
    if (updateProfile.fulfilled.match(resultAction)) {
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Local preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    // Upload
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    const result = await dispatch(uploadAvatarThunk(formData));
    setAvatarUploading(false);
    if (uploadAvatarThunk.fulfilled.match(result)) {
      setMessage({ type: 'success', text: 'Avatar updated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } else {
      setMessage({ type: 'error', text: 'Avatar upload failed' });
      setAvatarPreview(null);
    }
    // Reset file input so same file can be re-selected
    e.target.value = '';
  };

  const updatePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    const resultAction = await dispatch(changePassword({
      oldPassword: securityData.oldPassword,
      newPassword: securityData.newPassword
    }));
    if (changePassword.fulfilled.match(resultAction)) {
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setSecurityData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const saveNotificationPrefs = async () => {
    const response = await dispatch(updateNotificationPreferencesThunk(notificationPrefs));
    if (updateNotificationPreferencesThunk.fulfilled.match(response)) {
      setMessage({ type: 'success', text: 'Notification preferences updated' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const tabs = [
    { name: 'Profile', icon: User },
    { name: 'Security', icon: Lock },
    { name: 'Notifications', icon: Bell },
    { name: 'Appearance', icon: Palette },
  ];

  const AppearanceOption = ({ theme, label, description }) => (
    <button
      onClick={() => dispatch(setTheme(theme))}
      className={`
        flex flex-col text-left p-6 rounded-[2rem] border-2 transition-all group
        ${currentTheme === theme
          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-800'}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-900 border border-slate-200'}`}>
          <Palette size={20} />
        </div>
        {currentTheme === theme && (
          <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
            <Check size={14} strokeWidth={3} />
          </div>
        )}
      </div>
      <h4 className="font-black text-slate-900 dark:text-slate-100 mb-1">{label}</h4>
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{description}</p>
    </button>
  );

  const activeTabIcon = tabs.find(t => t.name === activeTab)?.icon || Palette;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto p-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Settings</h1>
            <p className="text-slate-400 dark:text-slate-500 font-medium">Manage your personal preferences and account security</p>
          </div>
          {message.text && (
            <div className={`px-4 py-2 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
              {message.text}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`
                  w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[13px] font-black tracking-tight transition-all
                  ${activeTab === tab.name
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800'}
                `}
              >
                <tab.icon size={18} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm p-10 transition-colors">
            {activeTab === 'Profile' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-8">
                  <div className="relative group">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarFileChange}
                    />
                    <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-3xl shadow-2xl overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
                      ) : user?.avatar ? (
                        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{user?.username?.[0]?.toUpperCase() || 'U'}</span>
                      )}
                      {avatarUploading && (
                        <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-all"
                    >
                      <Camera size={20} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">{user?.username}</h3>
                    <p className="text-slate-400 dark:text-slate-500 font-medium mb-4">{user?.jobTitle || 'No Title'} @ Trackly</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Change Photo</Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        onClick={() => { setAvatarPreview(null); }}
                      >Remove</Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Username"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    icon={Type}
                  />
                  <Input
                    label="Job Title"
                    name="jobTitle"
                    value={profileData.jobTitle}
                    onChange={handleProfileChange}
                    icon={Briefcase}
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    icon={Mail}
                  />
                  <Input
                    label="Location"
                    name="location"
                    value={profileData.location}
                    onChange={handleProfileChange}
                    icon={Globe}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Bio</label>
                  <textarea
                    name="bio"
                    className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none dark:text-slate-200"
                    placeholder="Tell us about yourself..."
                    value={profileData.bio}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="secondary" onClick={() => user && setProfileData({
                    username: user.username,
                    email: user.email,
                    bio: user.bio,
                    location: user.location,
                    jobTitle: user.jobTitle
                  })}>Cancel</Button>
                  <Button variant="primary" className="px-10" onClick={saveProfile} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">Security</h3>
                  <p className="text-slate-400 dark:text-slate-500 font-medium">Update your password to keep your account secure</p>
                </div>

                <div className="space-y-6 max-w-xl">
                  <Input
                    type="password"
                    label="Old Password"
                    name="oldPassword"
                    value={securityData.oldPassword}
                    onChange={handleSecurityChange}
                    icon={Lock}
                  />
                  <Input
                    type="password"
                    label="New Password"
                    name="newPassword"
                    value={securityData.newPassword}
                    onChange={handleSecurityChange}
                    icon={ShieldCheck}
                  />
                  <Input
                    type="password"
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={securityData.confirmPassword}
                    onChange={handleSecurityChange}
                    icon={ShieldCheck}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="secondary" onClick={() => setSecurityData({ oldPassword: '', newPassword: '', confirmPassword: '' })}>Cancel</Button>
                  <Button variant="primary" className="px-10" onClick={updatePassword} disabled={loading}>
                    {loading ? 'Updating...' : 'Change Password'}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'Notifications' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">Notification Preferences</h3>
                  <p className="text-slate-400 dark:text-slate-500 font-medium">Control which notifications you receive and share</p>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'assignments', label: 'Task Assignments', desc: 'When someone assigns a new task to you' },
                    { id: 'comments', label: 'New Comments', desc: 'When someone comments on your assigned tasks' },
                    { id: 'statusChanges', label: 'Status Updates', desc: 'When task status changes in your projects' },
                    { id: 'invites', label: 'Team Invitations', desc: 'When you are invited to a new project' },
                    { id: 'reminders', label: 'Deadline Reminders', desc: 'Notifications for upcoming task deadlines' }
                  ].map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:border-indigo-100 dark:hover:border-indigo-900/40">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-0.5">{pref.label}</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{pref.desc}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle(pref.id)}
                        className={`w-12 h-6 rounded-full transition-all relative ${notificationPrefs[pref.id] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationPrefs[pref.id] ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="secondary" onClick={() => user?.notificationPreferences && setNotificationPrefs(user.notificationPreferences)}>Cancel</Button>
                  <Button variant="primary" className="px-10" onClick={saveNotificationPrefs} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'Appearance' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">Appearance</h3>
                  <p className="text-slate-400 dark:text-slate-500 font-medium">Customize how Trackly looks on your device</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AppearanceOption
                    theme="light"
                    label="Light Mode"
                    description="Standard bright interface"
                  />
                  <AppearanceOption
                    theme="dark"
                    label="Dark Mode"
                    description="Easier on the eyes in low light"
                  />
                </div>
              </div>
            )}

            {activeTab !== 'Profile' && activeTab !== 'Appearance' && activeTab !== 'Security' && activeTab !== 'Notifications' && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                  {React.createElement(activeTabIcon, { size: 32 })}
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{activeTab} Settings</h3>
                <p className="text-slate-400 dark:text-slate-500 font-medium max-w-xs">
                  This module is currently being optimized for your experience.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
