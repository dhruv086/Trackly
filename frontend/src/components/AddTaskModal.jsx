import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Briefcase, AlertTriangle, Clock, Layers, Check,
  ChevronDown, CalendarDays, User2
} from 'lucide-react';
import Button from './ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import { addTaskAsync } from '../store/slices/taskSlice';
import { fetchProjects } from '../store/slices/projectSlice';
import { useParams } from 'react-router-dom';

const priorities = ['Low', 'Medium', 'High'];
const statuses = ['To Do', 'In Progress', 'Review', 'Done'];

const priorityColors = {
  Low: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-600 border-amber-200',
  High: 'bg-rose-50 text-rose-600 border-rose-200',
};

const SelectField = ({ label, icon: Icon, value, onChange, children, disabled }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
      <select
        required
        disabled={disabled}
        className="w-full pl-11 pr-8 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={14} />
    </div>
  </div>
);

const AddTaskModal = ({ isOpen, onClose, projectId: projectIdProp }) => {
  const { id: projectIdParam } = useParams();
  const knownProjectId = projectIdProp || projectIdParam || '';

  const dispatch = useDispatch();
  const { items: projects } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(knownProjectId);
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('To Do');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // When modal opens: ensure projects are loaded, pre-fill project if known
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchProjects());
      setSelectedProjectId(knownProjectId);
      setAssigneeId('');
      setError('');
    }
  }, [isOpen, dispatch, knownProjectId]);

  // Derive members of the currently selected project
  const selectedProject = useMemo(
    () => projects.find((p) => p._id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const projectMembers = useMemo(() => {
    if (!selectedProject) return [];
    // members is an array of populated user objects (from backend populate)
    return selectedProject.members || [];
  }, [selectedProject]);

  // Auto-select first member or current user when project changes
  useEffect(() => {
    if (!projectMembers.length) { setAssigneeId(''); return; }
    const meInProject = projectMembers.find((m) => m._id === user?._id);
    setAssigneeId(meInProject?._id || projectMembers[0]?._id || '');
  }, [projectMembers, user]);

  if (!isOpen) return null;

  const reset = () => {
    setTitle('');
    setDescription('');
    setSelectedProjectId(knownProjectId);
    setAssigneeId('');
    setPriority('Medium');
    setStatus('To Do');
    setDueDate('');
    setError('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Task title is required.'); return; }
    if (!selectedProjectId) { setError('Please select a project.'); return; }
    if (!dueDate) { setError('Please set a due date.'); return; }

    const statusToColumn = {
      'To Do': 'todo',
      'In Progress': 'inprogress',
      'Review': 'review',
      'Done': 'done',
    };

    setSubmitting(true);
    try {
      await dispatch(addTaskAsync({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate,
        assignees: assigneeId ? [assigneeId] : [],
        project: selectedProjectId,
        columnId: statusToColumn[status] || 'todo',
      })).unwrap();
      reset();
      onClose();
    } catch (err) {
      setError(err || 'Failed to create task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isProjectFixed = Boolean(knownProjectId);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create New Task</h2>
            <p className="text-slate-400 text-sm font-medium mt-0.5">
              {isProjectFixed && selectedProject
                ? `Adding to · ${selectedProject.name}`
                : 'Assign to a project and team member'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <X size={22} />
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-8 mb-4 px-4 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-sm font-semibold text-rose-600 flex-shrink-0">
            {error}
          </div>
        )}

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-8 pb-8 space-y-5">

          {/* Task title */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Title *</label>
            <div className="relative group">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                type="text"
                required
                autoFocus
                placeholder="What needs to be done?"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
            <textarea
              placeholder="Provide more context about this task..."
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-medium placeholder:text-slate-300 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all min-h-[100px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Project selector — only shown when projectId is NOT already known */}
          {!isProjectFixed && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project *</label>
              <div className="relative group">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={18} />
                <select
                  required
                  className="w-full pl-11 pr-8 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
                  value={selectedProjectId}
                  onChange={(e) => { setSelectedProjectId(e.target.value); setAssigneeId(''); }}
                >
                  <option value="">— Select a project —</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={14} />
              </div>
            </div>
          )}

          {/* Project badge (when fixed) */}
          {isProjectFixed && selectedProject && (
            <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <Layers size={15} className="text-indigo-500 flex-shrink-0" />
              <span className="text-sm font-bold text-indigo-700">{selectedProject.name}</span>
              <span className="ml-auto text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2 py-0.5 bg-indigo-100 rounded-full">
                {selectedProject.status}
              </span>
            </div>
          )}

          {/* Assign To + Due Date */}
          <div className="grid grid-cols-2 gap-5">
            {/* Assignee */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign To *</label>
              <div className="relative">
                <User2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                <select
                  required
                  disabled={!selectedProjectId}
                  className="w-full pl-11 pr-8 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                >
                  {!selectedProjectId && <option value="">Select project first</option>}
                  {selectedProjectId && projectMembers.length === 0 && (
                    <option value="">No members in project</option>
                  )}
                  {projectMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.username} ({member.email})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={14} />
              </div>
              {/* Member avatar strip */}
              {projectMembers.length > 0 && (
                <div className="flex items-center gap-1.5 pl-1 pt-1">
                  {projectMembers.slice(0, 5).map((m) => (
                    <div
                      key={m._id}
                      title={m.username}
                      onClick={() => setAssigneeId(m._id)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black cursor-pointer border-2 transition-all ${
                        assigneeId === m._id
                          ? 'border-indigo-500 bg-indigo-600 text-white scale-110 shadow-md shadow-indigo-200'
                          : 'border-white bg-slate-200 text-slate-600 hover:border-indigo-300 hover:scale-105'
                      }`}
                    >
                      {m.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  ))}
                  {projectMembers.length > 5 && (
                    <span className="text-[10px] text-slate-400 font-bold ml-1">+{projectMembers.length - 5}</span>
                  )}
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date *</label>
              <div className="relative group">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 pointer-events-none transition-colors" size={18} />
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Priority selector — visual pill buttons */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
            <div className="flex gap-3">
              {priorities.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2.5 rounded-2xl text-xs font-black tracking-wider border-2 transition-all ${
                    priority === p
                      ? priorityColors[p] + ' shadow-sm'
                      : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {priority === p && <Check size={11} className="inline mr-1" strokeWidth={3} />}
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Status selector */}
          <SelectField
            label="Initial Status"
            icon={AlertTriangle}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </SelectField>

          {/* Actions */}
          <div className="pt-2 flex gap-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 py-4 rounded-2xl"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-[2] py-4 rounded-2xl shadow-lg shadow-indigo-100"
              loading={submitting}
              disabled={!selectedProjectId || !dueDate || submitting}
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
