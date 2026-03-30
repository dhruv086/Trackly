import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Clock, Trash2, Paperclip,
  User, Flag, Calendar as CalendarIcon, Layers, MessageCircle,
  ChevronDown, CheckCheck, Circle, RotateCcw, Eye
} from 'lucide-react';
import AttachmentsPanel from './AttachmentsPanel';
import ChatBox from './ChatBox';
import {
  fetchTaskAttachments,
  uploadTaskAttachment,
  deleteTaskAttachment,
  markTaskAttachmentViewed,
} from '../store/slices/attachmentSlice';
import { updateTaskStatusAsync } from '../store/slices/taskSlice';

const TASK_STATUSES = [
  { label: 'To Do',       columnId: 'todo',       status: 'To Do',       dot: 'bg-slate-400',   icon: Circle,     colors: 'bg-slate-50 text-slate-600 border-slate-200' },
  { label: 'In Progress', columnId: 'inprogress', status: 'In Progress', dot: 'bg-blue-500',    icon: RotateCcw,  colors: 'bg-blue-50 text-blue-600 border-blue-200' },
  { label: 'Review',      columnId: 'review',     status: 'Review',      dot: 'bg-amber-400',   icon: Eye,        colors: 'bg-amber-50 text-amber-600 border-amber-200' },
  { label: 'Done',        columnId: 'done',       status: 'Done',        dot: 'bg-emerald-500', icon: CheckCheck, colors: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
];

const TaskDetailDrawer = ({ task, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { byTask, uploading } = useSelector((state) => state.attachments);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [activeSection, setActiveSection] = useState('details');
  const [statusOpen, setStatusOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const statusRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const h = (e) => { if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Load attachments when drawer opens or task changes
  useEffect(() => {
    if (isOpen && task?._id) {
      dispatch(fetchTaskAttachments(task._id));
    }
  }, [isOpen, task?._id, dispatch]);

  if (!task) return null;

  const taskId = task._id || task.id;
  const taskAttachments = byTask[taskId] || [];

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const priorityColors = {
    High:   'text-rose-600 bg-rose-50 border-rose-200',
    Medium: 'text-amber-600 bg-amber-50 border-amber-200',
    Low:    'text-emerald-600 bg-emerald-50 border-emerald-200',
  };

  // Normalize assignees (populated objects vs raw IDs)
  const assignees = (task.assignees || []).filter(Boolean).map((a) =>
    typeof a === 'object' ? a : { _id: a, username: '?' }
  );
  const primaryAssignee = assignees[0] || { username: 'Unassigned' };

  const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) : 'No date set';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-600" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Task Details</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                  <Trash2 size={18} />
                </button>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* ── Title + section toggle ───────────────────────────────── */}
            <div className="px-6 pt-6 pb-0 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${priorityColors[task.priority] || priorityColors.Medium}`}>
                  {task.priority}
                </span>

                {/* ── Status dropdown ─────────────────────────────── */}
                <div ref={statusRef} className="relative">
                  {(() => {
                    const current = TASK_STATUSES.find(s => s.columnId === (task.columnId || 'todo')) || TASK_STATUSES[0];
                    const CurIcon = current.icon;
                    return (
                      <>
                        <button
                          onClick={() => setStatusOpen(o => !o)}
                          disabled={updatingStatus}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all hover:shadow-sm disabled:opacity-60 ${current.colors}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${current.dot} ${updatingStatus ? 'animate-pulse' : ''}`} />
                          <CurIcon size={9} strokeWidth={2.5} />
                          {updatingStatus ? 'Saving…' : current.label}
                          <ChevronDown size={9} className={`transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {statusOpen && (
                          <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/80 overflow-hidden min-w-[170px]">
                            {TASK_STATUSES.map((s) => {
                              const SIcon = s.icon;
                              const isCurrent = s.columnId === (task.columnId || 'todo');
                              return (
                                <button
                                  key={s.columnId}
                                  onClick={async () => {
                                    setStatusOpen(false);
                                    if (isCurrent) return;
                                    setUpdatingStatus(true);
                                    await dispatch(updateTaskStatusAsync({
                                      taskId:   task._id || task.id,
                                      status:   s.status,
                                      columnId: s.columnId,
                                    }));
                                    setUpdatingStatus(false);
                                  }}
                                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-left transition-colors hover:bg-slate-50 ${isCurrent ? 'text-indigo-600 bg-indigo-50/40' : 'text-slate-700'}`}
                                >
                                  <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                                  <SIcon size={13} />
                                  {s.label}
                                  {isCurrent && <CheckCheck size={13} className="ml-auto text-indigo-400" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {task.project?.name && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-100 rounded-full">
                    <Layers size={10} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500">{task.project.name}</span>
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight mb-4">{task.title}</h2>

              {/* Section tabs */}
              <div className="flex gap-1 border-b border-slate-100">
                {[
                  { key: 'details',     label: 'Details' },
                  { key: 'attachments', label: `Attachments${taskAttachments.length > 0 ? ` (${taskAttachments.length})` : ''}` },
                  { key: 'chat',        label: 'Chat' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 -mb-px transition-all ${
                      activeSection === key
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {key === 'attachments' && <Paperclip size={11} className="inline mr-1" />}
                    {key === 'chat' && <MessageCircle size={11} className="inline mr-1" />}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Scrollable content ───────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">

              {/* DETAILS section */}
              {activeSection === 'details' && (
                <div className="px-6 py-6 space-y-6">
                  {/* Attribute grid */}
                  <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl">
                    {/* Assignees */}
                    <div className="flex items-start gap-3">
                      <User size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignees</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {assignees.length > 0 ? assignees.map((a) => (
                            <div key={a._id} className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] text-white font-black">
                                {getInitials(a.username)}
                              </div>
                              <span className="text-xs font-bold text-slate-700">{a.username}</span>
                            </div>
                          )) : (
                            <span className="text-xs text-slate-400 font-medium">Unassigned</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="flex items-start gap-3">
                      <Flag size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</p>
                        <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-md mt-1.5 border ${priorityColors[task.priority] || priorityColors.Medium}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    {/* Due date */}
                    <div className="flex items-start gap-3">
                      <CalendarIcon size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</p>
                        <span className="text-sm font-bold text-slate-700 mt-1.5 block">{formattedDate}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-start gap-3">
                      <Clock size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                        <span className="text-sm font-bold text-slate-700 mt-1.5 block">{task.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Description</h3>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 min-h-[80px]">
                      {task.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Comments placeholder */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <MessageCircle size={15} className="text-slate-400" />
                      Comments
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-md">0</span>
                    </h3>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                        {getInitials(primaryAssignee.username)}
                      </div>
                      <div className="flex-1 bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100 text-sm italic text-slate-400">
                        Comments module coming soon...
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ATTACHMENTS section */}
              {activeSection === 'attachments' && (
                <div className="px-6 py-6">
                  <AttachmentsPanel
                    attachments={taskAttachments}
                    uploading={uploading}
                    onUpload={(file) => dispatch(uploadTaskAttachment({ taskId, file }))}
                    onDelete={(attachmentId) => dispatch(deleteTaskAttachment({ taskId, attachmentId }))}
                    onView={(attachmentId) => dispatch(markTaskAttachmentViewed({ taskId, attachmentId }))}
                    currentUser={currentUser}
                    mode="task"
                    members={assignees}
                  />
                </div>
              )}

              {/* CHAT section */}
              {activeSection === 'chat' && (
                <div className="flex flex-col" style={{ height: 'calc(100vh - 260px)' }}>
                  <ChatBox mode="task" contextId={taskId} members={assignees} />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskDetailDrawer;
