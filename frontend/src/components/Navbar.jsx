import React from 'react';
import { useSelector } from 'react-redux';
import { Search, Bell, ChevronDown, Plus, HelpCircle } from 'lucide-react';
import Button from './ui/Button';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  const getInitials = (username) => {
    if (!username) return '??';
    return username.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="h-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40 px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-8 flex-1">
        <div className="relative group w-full max-w-md hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search projects, tasks, members..."
            className="w-full pl-12 pr-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none dark:text-slate-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-50 dark:border-slate-700">
          <ThemeToggle />
          <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all">
            <HelpCircle size={20} />
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl relative transition-all group">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full group-hover:scale-125 transition-transform"></span>
            )}
          </button>
        </div>

        <div className="mx-2 w-px h-8 bg-slate-100 hidden sm:block"></div>

        <button className="flex items-center gap-3 pl-2 group transition-all active:scale-95">
          <div className="text-right hidden lg:block">
            <p className="text-xs font-black text-slate-900 dark:text-slate-100 leading-none">{user?.username || 'Guest'}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tighter font-bold">{user?.role || 'User'}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-100 p-0.5 shadow-sm group-hover:border-indigo-200 transition-all">
            <div className="w-full h-full rounded-[0.85rem] bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xs overflow-hidden">
              {user?.avatar
                ? <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5001${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                : getInitials(user?.username)}
            </div>
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
