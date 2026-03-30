import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Calendar, AlertCircle, Layers, ArrowUp, Minus, ArrowDown, ChevronDown, CheckCheck, Circle, RotateCcw, Eye } from 'lucide-react';
import { formatDistanceToNow, isPast, isToday, isTomorrow, format } from 'date-fns';
import { updateTaskStatusAsync } from '../store/slices/taskSlice';

// ─── Config ───────────────────────────────────────────────────────────────────

const priorityConfig = {
  High:   { badge: 'bg-rose-100 text-rose-600 border border-rose-200',   icon: ArrowUp,    iconClass: 'text-rose-500' },
  Medium: { badge: 'bg-amber-100 text-amber-600 border border-amber-200', icon: Minus,      iconClass: 'text-amber-500' },
  Low:    { badge: 'bg-emerald-100 text-emerald-600 border border-emerald-200', icon: ArrowDown, iconClass: 'text-emerald-500' },
};

const STATUS_OPTIONS = [
  { label: 'To Do',       columnId: 'todo',       colors: 'text-slate-600 bg-slate-50 hover:bg-slate-100',       dot: 'bg-slate-400',   icon: Circle },
  { label: 'In Progress', columnId: 'inprogress', colors: 'text-blue-600 bg-blue-50 hover:bg-blue-100',          dot: 'bg-blue-500',    icon: RotateCcw },
  { label: 'Review',      columnId: 'review',     colors: 'text-amber-600 bg-amber-50 hover:bg-amber-100',       dot: 'bg-amber-400',   icon: Eye },
  { label: 'Done',        columnId: 'done',       colors: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100', dot: 'bg-emerald-500', icon: CheckCheck },
];

const colToStatus = {
  todo:       'To Do',
  inprogress: 'In Progress',
  review:     'Review',
  done:       'Done',
};

function getDueDateLabel(dueDate) {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  if (isToday(d))    return { text: 'Due today',     urgent: true };
  if (isTomorrow(d)) return { text: 'Due tomorrow',  urgent: true };
  if (isPast(d))     return { text: `${formatDistanceToNow(d)} overdue`, overdue: true };
  return { text: `Due ${format(d, 'MMM d')}`, urgent: false };
}

const avatarColors = [
  'bg-indigo-500', 'bg-violet-500', 'bg-rose-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-sky-500', 'bg-pink-500', 'bg-teal-500',
];
function avatarColor(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

// ─── Component ────────────────────────────────────────────────────────────────

const TaskCard = ({ task, onClick }) => {
  const dispatch = useDispatch();
  const [statusOpen, setStatusOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const dropdownRef = useRef(null);

  const pc = priorityConfig[task.priority] || priorityConfig.Medium;
  const PriorityIcon = pc.icon;
  const dueDateInfo = getDueDateLabel(task.dueDate);

  const assignees = (task.assignees || []).filter(Boolean).map((a) =>
    typeof a === 'object' ? a : { _id: a, username: '?' }
  );
  const projectName = task.project?.name || null;

  // Current status derived from columnId
  const currentStatus = STATUS_OPTIONS.find(s => s.columnId === (task.columnId || 'todo')) || STATUS_OPTIONS[0];
  const StatusIcon = currentStatus.icon;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setStatusOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleStatusChange = async (e, option) => {
    e.stopPropagation(); // don't open drawer
    setStatusOpen(false);
    if (option.columnId === task.columnId) return;
    setUpdating(true);
    await dispatch(updateTaskStatusAsync({
      taskId:   task._id || task.id,
      status:   colToStatus[option.columnId],
      columnId: option.columnId,
    }));
    setUpdating(false);
  };

  return (
    <div
      onClick={() => onClick && onClick(task)}
      className="bg-white p-4 rounded-[1.25rem] shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/60 transition-all cursor-pointer group mb-2.5 select-none"
    >
      {/* Top row — priority + project badge */}
      <div className="flex items-center justify-between mb-2.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${pc.badge}`}>
          <PriorityIcon size={9} strokeWidth={3} />
          {task.priority || 'Medium'}
        </span>

        {projectName && (
          <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full px-2 py-0.5 max-w-[120px] overflow-hidden">
            <Layers size={9} className="flex-shrink-0" />
            <span className="text-[9px] font-black truncate tracking-wide">{projectName}</span>
          </div>
        )}
      </div>

      {/* Task title */}
      <h4 className="text-sm font-bold text-slate-800 leading-snug mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
        {task.title}
      </h4>

      {/* Assignees row */}
      {assignees.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex -space-x-1.5">
            {assignees.slice(0, 3).map((a) => (
              <div
                key={a._id}
                title={a.username}
                className={`w-6 h-6 rounded-full border-2 border-white ${avatarColor(a.username)} flex items-center justify-center text-[9px] font-black text-white flex-shrink-0`}
              >
                {a.username?.[0]?.toUpperCase() || '?'}
              </div>
            ))}
            {assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500">
                +{assignees.length - 3}
              </div>
            )}
          </div>
          {assignees.length === 1 && (
            <span className="text-[10px] text-slate-400 font-semibold truncate">
              {assignees[0].username}
            </span>
          )}
        </div>
      )}

      {/* Bottom row — status pill + due date */}
      <div className="flex items-center justify-between gap-2 mt-1">
        {/* ── Status button ──────────────────────────────────────────── */}
        <div
          ref={dropdownRef}
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setStatusOpen(o => !o); }}
            disabled={updating}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black border border-transparent transition-all ${currentStatus.colors} ${updating ? 'opacity-60' : 'hover:border-current/20'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot} ${updating ? 'animate-pulse' : ''}`} />
            <StatusIcon size={9} strokeWidth={2.5} />
            {updating ? 'Saving…' : currentStatus.label}
            <ChevronDown size={9} className={`transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
          </button>

          {statusOpen && (
            <div className="absolute bottom-full mb-1.5 left-0 z-50 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden min-w-[150px]">
              {STATUS_OPTIONS.map((opt) => {
                const OptIcon = opt.icon;
                const isCurrent = opt.columnId === (task.columnId || 'todo');
                return (
                  <button
                    key={opt.columnId}
                    onClick={(e) => handleStatusChange(e, opt)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-left transition-colors hover:bg-slate-50 ${isCurrent ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${opt.dot}`} />
                    <OptIcon size={11} />
                    {opt.label}
                    {isCurrent && <CheckCheck size={11} className="ml-auto text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Due date */}
        {dueDateInfo && (
          <div className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-lg px-2 py-1 ${
            dueDateInfo.overdue
              ? 'bg-rose-50 text-rose-600'
              : dueDateInfo.urgent
                ? 'bg-amber-50 text-amber-600'
                : 'bg-slate-50 text-slate-400'
          }`}>
            <Calendar size={10} />
            <span>{dueDateInfo.text}</span>
            {dueDateInfo.overdue && <AlertCircle size={9} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
