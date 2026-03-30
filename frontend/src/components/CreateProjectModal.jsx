import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProjectAsync } from '../store/slices/projectSlice';
import {
  X, Layers, AlignLeft, Calendar, Search,
  UserPlus, UserMinus, Check, ChevronDown, Loader2
} from 'lucide-react';
import Button from './ui/Button';
import API from '../utils/api';

// Deterministic avatar color
const avatarColors = [
  'bg-indigo-500', 'bg-violet-500', 'bg-rose-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-sky-500', 'bg-pink-500', 'bg-teal-500',
];
function avatarColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
}

const EMPTY_FORM = { name: '', description: '', deadline: '', status: 'Active' };

const CreateProjectModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Member search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const searchTimer = useRef(null);
  const searchInputRef = useRef(null);

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(EMPTY_FORM);
      setSelectedMembers([]);
      setSearchQuery('');
      setSearchResults([]);
      setError('');
    }
  }, [isOpen]);

  // Debounced member search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await API.get(`/team/search?query=${encodeURIComponent(searchQuery)}`);
        // Exclude already-selected, and current user (they're owner, auto-added)
        const filtered = (res.data.members || []).filter(
          (u) => u._id !== currentUser?._id && !selectedMembers.find((m) => m._id === u._id)
        );
        setSearchResults(filtered);
      } catch (_) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery, selectedMembers, currentUser]);

  if (!isOpen) return null;

  const addMember = (user) => {
    setSelectedMembers((prev) => [...prev, user]);
    setSearchQuery('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const removeMember = (userId) => {
    setSelectedMembers((prev) => prev.filter((m) => m._id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setError('');
    setLoading(true);
    try {
      await dispatch(createProjectAsync({
        ...formData,
        // Pass additional member IDs — backend will add them after creation
        additionalMembers: selectedMembers.map((m) => m._id),
      })).unwrap();
      onClose();
    } catch (err) {
      setError(err || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-1 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Project</h2>
            <p className="text-slate-400 text-sm font-medium mt-0.5">Define a new workspace for your team.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-8 py-6 space-y-5">

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-sm font-semibold text-rose-600">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Name *</label>
            <div className="relative group">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g., Q3 Marketing Campaign"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
            <div className="relative group">
              <AlignLeft className="absolute left-4 top-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <textarea
                placeholder="Briefly describe the project goals..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-medium placeholder:text-slate-300 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all min-h-[90px] resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {/* Deadline + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={17} />
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-11 pr-3 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 font-bold focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 font-bold focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none pr-9"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Review">Review</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={14} />
              </div>
            </div>
          </div>

          {/* ─── MEMBER SEARCH ─── */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <UserPlus size={13} />
              Add Team Members
            </label>

            {/* Selected member chips */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((m) => (
                  <div
                    key={m._id}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 bg-indigo-50 border border-indigo-100 rounded-full"
                  >
                    <div className={`w-6 h-6 rounded-full ${avatarColor(m.username)} flex items-center justify-center text-[10px] font-black text-white flex-shrink-0`}>
                      {m.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-indigo-700">{m.username}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(m._id)}
                      className="text-indigo-400 hover:text-rose-500 transition-colors ml-0.5"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={17} />
              {searching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 animate-spin" size={16} />
              )}
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by username or email..."
                className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div className="rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/80 overflow-hidden bg-white">
                {searchResults.slice(0, 5).map((u) => (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => addMember(u)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50/60 transition-colors text-left border-b border-slate-50 last:border-0"
                  >
                    <div className={`w-8 h-8 rounded-full ${avatarColor(u.username)} flex items-center justify-center text-xs font-black text-white flex-shrink-0`}>
                      {u.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{u.username}</p>
                      <p className="text-xs text-slate-400 font-medium truncate">{u.email}</p>
                    </div>
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <UserPlus size={12} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No results hint */}
            {searchQuery && !searching && searchResults.length === 0 && (
              <p className="text-xs text-slate-400 font-medium px-1">
                No users found for "{searchQuery}"
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 py-4 rounded-2xl"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-[2] py-4 rounded-2xl shadow-lg shadow-indigo-100"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Creating...' : `Create Project${selectedMembers.length > 0 ? ` + ${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''}` : ''}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
