import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Users,
  Calendar,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Briefcase, label: 'Projects', path: '/projects' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Users, label: 'Teams', path: '/teams' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const getInitials = (username) => {
    if (!username) return '??';
    return username.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className={`flex flex-col h-screen bg-slate-900 text-slate-300 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'} sticky top-0 border-r border-slate-800 z-50`}>
      <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/50">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-white tracking-tighter">TRACKLY</span>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-16 p-1.5 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 transition-all border-4 border-slate-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
              flex items-center w-full px-4 py-3.5 rounded-2xl transition-all duration-200 group relative
              ${isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 active-nav-glow'
                : 'hover:bg-slate-800 hover:text-white'}
            `}
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-4 font-bold text-[13px] tracking-tight">{item.label}</span>}
            {!isCollapsed && item.label === 'Notifications' && unreadCount > 0 && (
              <span className="ml-auto w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-lg flex items-center justify-center shadow-lg shadow-rose-500/20">{unreadCount}</span>
            )}
          </NavLink>
        ))}

        <div className="pt-8 mb-2">
          {!isCollapsed && <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Administration</p>}
          <NavLink
            to="/admin"
            className={({ isActive }) => `
              flex items-center w-full px-4 py-3.5 rounded-2xl transition-all duration-200 group
              ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-slate-800 hover:text-white'}
            `}
          >
            <ShieldCheck size={20} />
            {!isCollapsed && <span className="ml-4 font-bold text-[13px] tracking-tight">Admin Panel</span>}
          </NavLink>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <div className={`p-4 rounded-[2rem] bg-slate-800/30 flex items-center gap-4 ${isCollapsed ? 'justify-center border border-slate-800' : ''}`}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xs shadow-lg">
            {user?.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full rounded-2xl object-cover" /> : getInitials(user?.username)}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate">{user?.username || 'Guest'}</p>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">{user?.role || 'User'}</p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
