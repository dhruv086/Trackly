import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/ui/Button';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Circle
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedTasks } from '../../store/slices/taskSlice';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`); // 07:00 – 21:00

function taskColor(task) {
  if (task.priority === 'High') return 'bg-rose-500';
  if (task.priority === 'Medium') return 'bg-amber-500';
  if (task.priority === 'Low') return 'bg-emerald-500';
  return 'bg-indigo-500';
}

function buildEventsMap(tasks) {
  const map = {};
  tasks.forEach(task => {
    if (!task.dueDate) return;
    const d = new Date(task.dueDate);
    // key: YYYY-MM-DD (local)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!map[key]) map[key] = [];
    map[key].push(task);
  });
  return map;
}

function getWeekDays(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun
  const monday = new Date(d);
  monday.setDate(d.getDate() - day); // Start from Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}

const CalendarPage = () => {
  const dispatch = useDispatch();
  const { assignedTasks } = useSelector((state) => state.tasks);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('Month');

  React.useEffect(() => {
    dispatch(fetchAssignedTasks());
  }, [dispatch]);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const events = buildEventsMap(assignedTasks);

  const eventKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  // Navigation
  const navigate = (dir) => {
    if (view === 'Month') setCurrentDate(new Date(year, month + dir, 1));
    else if (view === 'Week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + dir * 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + dir);
      setCurrentDate(d);
    }
  };

  const setToday = () => setCurrentDate(new Date());

  // Header label
  const headerLabel = view === 'Month'
    ? `${MONTHS[month]} ${year}`
    : view === 'Week'
      ? (() => {
        const days = getWeekDays(currentDate);
        return `${MONTHS[days[0].getMonth()]} ${days[0].getDate()} – ${days[6].getDate()}, ${days[6].getFullYear()}`;
      })()
      : currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // ── Month View ──
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const prevMonthDays = Array.from({ length: startDay }, (_, i) => ({
    day: new Date(year, month, 0).getDate() - startDay + i + 1, current: false
  }));
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, current: true }));
  const calendarDays = [...prevMonthDays, ...currentMonthDays];
  const today = new Date();

  return (
    <MainLayout>
      <div className="p-8 space-y-8 h-full flex flex-col">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Project Calendar</h1>
            <p className="text-slate-400 dark:text-slate-500 font-medium">Track your deadlines and team milestones</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="md">
              <ArrowUpRight size={18} className="mr-2" />
              Schedule
            </Button>
            <Button variant="primary" size="md">
              <Plus size={18} className="mr-2" />
              Add Milestone
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col flex-1 transition-colors">
          {/* Calendar toolbar */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight min-w-[220px]">
                {headerLabel}
              </h2>
              <div className="flex bg-slate-100/50 dark:bg-slate-800 p-1 rounded-xl">
                <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => navigate(1)} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                  <ChevronRight size={20} />
                </button>
              </div>
              <button onClick={setToday} className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">
                Today
              </button>
            </div>

            {/* View switcher */}
            <div className="flex bg-slate-100/50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700">
              {['Month', 'Week', 'Day'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${v === view ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* ── MONTH VIEW ── */}
          {view === 'Month' && (
            <>
              <div className="grid grid-cols-7 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                {DAYS_SHORT.map(day => (
                  <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 flex-1 overflow-y-auto min-h-0">
                {calendarDays.map((item, i) => {
                  const key = `${year}-${String(month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
                  const dayEvents = events[key] || [];
                  const isToday = item.current && item.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  return (
                    <div key={i} className={`min-h-[140px] border-r border-b border-slate-50 dark:border-slate-800 p-3 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${!item.current ? 'bg-slate-50/30 dark:bg-slate-900/30 opacity-40' : ''}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-black ${isToday ? 'w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center' : 'text-slate-800 dark:text-slate-200'}`}>
                          {item.day}
                        </span>
                        {dayEvents.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 opacity-60" />}
                      </div>
                      <div className="space-y-1.5">
                        {dayEvents.map((ev, idx) => (
                          <div key={idx} className={`${taskColor(ev)} p-2 rounded-xl text-white shadow-sm cursor-pointer hover:opacity-90 transition-opacity`}>
                            <p className="text-[10px] font-black leading-tight mb-0.5 truncate">{ev.title}</p>
                            <p className="text-[8px] font-bold opacity-70 truncate">{ev.project?.name || 'Task'}</p>
                          </div>
                        ))}
                        {item.current && (
                          <button className="w-full py-2 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-300 dark:text-slate-600">
                            <Plus size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── WEEK VIEW ── */}
          {view === 'Week' && (() => {
            const weekDays = getWeekDays(currentDate);
            return (
              <>
                <div className="grid grid-cols-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                  <div className="py-4" />
                  {weekDays.map((d, i) => {
                    const isToday = d.toDateString() === today.toDateString();
                    return (
                      <div key={i} className="py-4 text-center">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{DAYS_SHORT[d.getDay()]}</p>
                        <span className={`text-lg font-black mt-1 inline-flex items-center justify-center w-9 h-9 rounded-xl ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                          {d.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="overflow-y-auto flex-1 min-h-0">
                  {HOURS.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b border-slate-50 dark:border-slate-800 min-h-[60px]">
                      <div className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 text-right pr-6">{hour}</div>
                      {weekDays.map((d, di) => {
                        const key = eventKey(d);
                        const hourNum = parseInt(hour);
                        const dayTasks = (events[key] || []).filter(t => {
                          const due = new Date(t.dueDate);
                          return due.getHours() === hourNum;
                        });
                        return (
                          <div key={di} className="border-l border-slate-50 dark:border-slate-800 p-1.5 hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                            {dayTasks.map((t, ti) => (
                              <div key={ti} className={`${taskColor(t)} text-white text-[10px] font-black rounded-lg px-2 py-1 mb-1 truncate`}>
                                {t.title}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </>
            );
          })()}

          {/* ── DAY VIEW ── */}
          {view === 'Day' && (() => {
            const key = eventKey(currentDate);
            const dayTasks = events[key] || [];
            return (
              <div className="flex-1 overflow-y-auto min-h-0">
                {/* All-day banner */}
                {dayTasks.length > 0 && (
                  <div className="px-8 py-4 border-b border-slate-50 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-950/20">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Tasks Due Today</p>
                    <div className="flex flex-wrap gap-3">
                      {dayTasks.map((t, i) => (
                        <div key={i} className={`${taskColor(t)} text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2`}>
                          <CheckCircle2 size={12} className="opacity-80" />
                          {t.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {HOURS.map((hour) => {
                  const hourNum = parseInt(hour);
                  const slotTasks = dayTasks.filter(t => {
                    const due = new Date(t.dueDate);
                    return due.getHours() === hourNum;
                  });
                  const isCurrentHour = today.toDateString() === currentDate.toDateString() && today.getHours() === hourNum;
                  return (
                    <div key={hour} className={`flex border-b border-slate-50 dark:border-slate-800 min-h-[72px] transition-colors ${isCurrentHour ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : 'hover:bg-slate-50/30 dark:hover:bg-slate-800/20'}`}>
                      <div className="w-24 px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 text-right flex-shrink-0 flex items-start justify-end pt-4">
                        <span className={isCurrentHour ? 'text-indigo-600 dark:text-indigo-400' : ''}>{hour}</span>
                      </div>
                      <div className="flex-1 border-l border-slate-100 dark:border-slate-800 p-3 flex flex-wrap gap-2 items-start">
                        {isCurrentHour && (
                          <div className="w-full h-0.5 bg-indigo-500 rounded-full mb-2 relative">
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-indigo-500 rounded-full" />
                          </div>
                        )}
                        {slotTasks.map((t, i) => (
                          <div key={i} className={`${taskColor(t)} text-white px-3 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm`}>
                            <Clock size={12} className="opacity-80 flex-shrink-0" />
                            <div>
                              <p className="leading-none">{t.title}</p>
                              {t.project?.name && <p className="text-[9px] opacity-70 mt-0.5">{t.project.name}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </MainLayout>
  );
};

export default CalendarPage;
