import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Bell,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  Clock,
  MoreVertical,
  Check,
  Search,
  Filter
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsReadAsync, markAllAsReadAsync } from '../../store/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';


const Notifications = () => {
  const dispatch = useDispatch();
  const { items: notifications, loading } = useSelector((state) => state.notifications);
  const [filter, setFilter] = useState('All');

  React.useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.isRead;
    if (filter === 'Comments') return n.type === 'comment';
    if (filter === 'Assignments') return n.type === 'assignment';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'comment': return MessageSquare;
      case 'assignment': return UserPlus;
      case 'status_change': return CheckCircle2;
      case 'invite': return UserPlus;
      case 'reminder': return Clock;
      default: return Bell;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'comment': return 'text-indigo-500 bg-indigo-50';
      case 'assignment': return 'text-purple-500 bg-purple-50';
      case 'status_change': return 'text-emerald-500 bg-emerald-50';
      case 'reminder': return 'text-rose-500 bg-rose-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100 flex-shrink-0">
              <Bell size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
              <p className="text-slate-400 font-medium">Stay updated with your latest team activities</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => dispatch(markAllAsReadAsync())}
          >
            <Check size={18} className="mr-2" />
            Mark all as read
          </Button>
        </div>

        <div className="flex items-center gap-1 bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm w-fit">
          {['All', 'Unread', 'Comments', 'Assignments'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                ${filter === f
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
              `}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No notifications found</div>
          ) : (
            filteredNotifications.map((notif) => {
              const Icon = getIcon(notif.type);
              const colorClass = getColor(notif.type);
              return (
                <div
                  key={notif._id}
                  className={`p-6 flex items-start gap-6 group hover:bg-slate-50/50 transition-all ${!notif.isRead ? 'bg-indigo-50/10' : ''}`}
                  onClick={() => !notif.isRead && dispatch(markAsReadAsync(notif._id))}
                >
                  <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-slate-600 leading-tight">
                        <span className="font-black text-slate-900">{notif.sender?.username || 'System'}</span> {notif.message}
                      </p>
                      {!notif.isRead && (
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white ring-4 ring-indigo-50" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{notif.project?.name || 'General'}</span>
                      <span className="text-slate-200">|</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {formatDistanceToNow(new Date(notif.createdAt))} ago
                      </span>
                    </div>
                  </div>
                  <button className="p-2 text-slate-200 hover:text-slate-400 group-hover:text-slate-300 transition-all rounded-xl">
                    <MoreVertical size={18} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <Button
          variant="ghost"
          className="w-full text-slate-400 font-black py-4"
          onClick={() => console.log('Load older notifications')}
        >
          Load Older Notifications
        </Button>
      </div>
    </MainLayout>
  );
};

export default Notifications;
