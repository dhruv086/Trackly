import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, fetchAllProjects, fetchAdminStats, fetchAdminLogs, fetchGlobalSettings, updateUserRoleThunk, updateGlobalSettingsThunk, updateSettingLocally } from '../../store/slices/adminSlice';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/ui/Button';
import {
  Shield,
  Users,
  FileText,
  Settings,
  MoreVertical,
  Search,
  CheckCircle,
  AlertTriangle,
  Activity,
  Briefcase,
  ChevronDown,
  Clock,
  ShieldCheck,
  Mail,
  Sliders,
  Save,
  Loader
} from 'lucide-react';

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { users, projects, logs, settings, stats, loading, saving } = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState('Users');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchAllProjects());
    dispatch(fetchAdminStats());
    dispatch(fetchAdminLogs());
    dispatch(fetchGlobalSettings());
  }, [dispatch]);

  const handleRoleChange = (userId, newRole) => {
    dispatch(updateUserRoleThunk({ userId, role: newRole }));
  };

  const handleSettingToggle = (key) => {
    const updated = { [key]: !settings[key] };
    dispatch(updateSettingLocally(updated));
    dispatch(updateGlobalSettingsThunk({ ...settings, ...updated }));
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = (logs || []).filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="p-8 space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20 flex-shrink-0">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Admin Console</h1>
              <p className="text-slate-400 dark:text-slate-500 font-medium">System-level management and oversight</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className={`rounded-2xl border-slate-100 dark:border-slate-800 ${activeTab === 'Logs' ? 'bg-slate-100 dark:bg-slate-800 ring-2 ring-indigo-500/20' : ''}`}
              onClick={() => setActiveTab('Logs')}
            >
              <FileText size={18} className="mr-2" />
              System Logs
            </Button>
            <Button
              variant="primary"
              className={`rounded-2xl shadow-lg shadow-indigo-100 ${activeTab === 'Settings' ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => setActiveTab('Settings')}
            >
              <Settings size={18} className="mr-2" />
              Global Settings
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
            { label: 'Total Projects', value: stats.totalProjects, icon: Briefcase, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' },
            { label: 'Active Projects', value: stats.activeProjects, icon: Activity, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
            { label: 'System Health', value: 'Healthy', icon: CheckCircle, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 transition-all hover:scale-[1.02] hover:shadow-md">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Tab bar + search */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700">
              {['Users', 'Projects', 'Logs', 'Settings'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                className="pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all w-full md:w-64 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {/* Users Tab */}
            {activeTab === 'Users' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">User Profile</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Role</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date Joined</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase">
                            {user.username?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-slate-100 mb-0.5">{user.username}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="relative inline-block group">
                          <span className={`px-3 py-1 ${user.role === 'Admin' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'} text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-slate-700`}>
                            {user.role}
                            <ChevronDown size={12} />
                          </span>
                          <div className="absolute left-0 mt-2 w-32 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl hidden group-hover:block z-50 overflow-hidden">
                            {['Admin', 'Member'].map(role => (
                              <button
                                key={role}
                                onClick={() => handleRoleChange(user._id, role)}
                                className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${user.role === role ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
                              >
                                {role}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-slate-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              /* Projects Tab */
            ) : activeTab === 'Projects' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Project Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Owner</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Members</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredProjects.map(project => (
                    <tr key={project._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-5 text-sm font-black text-slate-900 dark:text-slate-100">{project.name}</td>
                      <td className="px-8 py-5 text-xs text-slate-400 dark:text-slate-500 font-medium">{project.owner?.username}</td>
                      <td className="px-8 py-5">
                        <div className="flex -space-x-2">
                          {project.members?.slice(0, 3).map((m, i) => (
                            <div key={i} className="w-6 h-6 rounded-lg border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase">
                              {m.username?.[0]}
                            </div>
                          ))}
                          {project.members?.length > 3 && (
                            <div className="w-6 h-6 rounded-lg border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400 dark:text-slate-500">
                              +{project.members.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${project.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                          {project.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              /* Logs Tab */
            ) : activeTab === 'Logs' ? (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredLogs.map(log => (
                  <div key={log.id} className="px-8 py-6 flex items-center justify-between hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${log.status === 'Success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                          log.status === 'Warning' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' :
                            'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                        }`}>
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-slate-100 mb-0.5">{log.action}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">By {log.user} • {new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${log.status === 'Success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                        log.status === 'Warning' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' :
                          'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                      }`}>
                      {log.status}
                    </span>
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <div className="p-20 text-center text-slate-400 dark:text-slate-500 font-medium">No system logs found matching your query.</div>
                )}
              </div>

              /* Settings Tab */
            ) : (
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Global Configuration</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Changes are saved immediately.</p>
                  </div>
                  {saving && (
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest">
                      <Loader size={14} className="animate-spin" />
                      Saving...
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'maintenanceMode', label: 'Maintenance Mode', icon: ShieldCheck, desc: 'Block all non-admin access to the system' },
                    { key: 'allowNewRegistrations', label: 'Allow Registrations', icon: Users, desc: 'Allow new users to create accounts' },
                    { key: 'requireEmailVerification', label: 'Email Verification', icon: Mail, desc: 'Force users to verify their email addresses' },
                  ].map((s) => (
                    <div key={s.key} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-indigo-500/5 group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm group-hover:shadow-md transition-shadow">
                          <s.icon size={22} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-0.5">{s.label}</h4>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{s.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSettingToggle(s.key)}
                        className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${settings[s.key] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                        aria-label={`Toggle ${s.label}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings[s.key] ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                  <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-indigo-500/5">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                        <Sliders size={22} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-0.5">Max Projects/User</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Maximum number of projects a user can own</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-lg">{settings.maxProjectsPerUser}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminPanel;
