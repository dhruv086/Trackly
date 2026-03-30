import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../store/slices/notificationSlice';
import { MessageSquare, CheckCircle2, UserPlus, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const iconMap = {
  comment: { icon: MessageSquare, iconColor: 'text-indigo-500', bgColor: 'bg-indigo-50' },
  assignment: { icon: UserPlus, iconColor: 'text-purple-500', bgColor: 'bg-purple-50' },
  status_change: { icon: CheckCircle2, iconColor: 'text-emerald-500', bgColor: 'bg-emerald-50' },
  default: { icon: Bell, iconColor: 'text-rose-500', bgColor: 'bg-rose-50' },
};

const ActivityTimeline = () => {
  const dispatch = useDispatch();
  const { items: notifications, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const recent = notifications.slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 h-full transition-colors">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Recent Activity</h3>

      {loading && !recent.length ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4" />
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Bell size={32} className="text-slate-200 dark:text-slate-700 mb-3" />
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-px before:bg-slate-100 dark:before:bg-slate-800">
          {recent.map((notif) => {
            const config = iconMap[notif.type] || iconMap.default;
            const Icon = config.icon;
            let timeAgo = 'just now';
            try {
              timeAgo = formatDistanceToNow(new Date(notif.createdAt)) + ' ago';
            } catch (_) {}

            return (
              <div key={notif._id} className="relative flex items-start gap-4">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl ${config.bgColor} ${config.iconColor} z-10 shadow-sm border-2 border-white dark:border-slate-900 flex-shrink-0`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {notif.sender?.username || 'System'}
                    </span>{' '}
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {notif.project?.name && (
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                        {notif.project.name}
                      </span>
                    )}
                    {notif.project?.name && <span className="text-slate-200 dark:text-slate-700">·</span>}
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
                      {timeAgo}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
