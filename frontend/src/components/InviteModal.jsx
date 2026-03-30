import React, { useState } from 'react';
import { X, Mail, Shield, AlertCircle, Search, CheckCircle2, UserPlus, Loader } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { inviteMemberAsync, addMemberToProjectAsync, fetchMembers } from '../store/slices/teamSlice';
import Button from './ui/Button';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import API from '../utils/api';

const roles = ['Project Manager', 'Senior Designer', 'Frontend Lead', 'UX Researcher', 'Backend Developer', 'QA Engineer', 'Product Owner'];

const InviteModal = ({ isOpen, onClose, projectId }) => {
  const dispatch = useDispatch();
  const { members: allMembers, loading } = useSelector((state) => state.team);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [emailSearchLoading, setEmailSearchLoading] = useState(false);
  const [emailSearchError, setEmailSearchError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [role, setRole] = useState(roles[0]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchMembers());
      setSelectedUser(null);
      setSearchQuery('');
      setEmailInput('');
      setEmailSearchError('');
      setSuccessMsg('');
    }
  }, [dispatch, isOpen]);

  if (!isOpen) return null;

  const filteredMembers = searchQuery.trim()
    ? allMembers.filter(m =>
      m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const handleFindByEmail = async () => {
    if (!emailInput.trim()) return;
    setEmailSearchLoading(true);
    setEmailSearchError('');
    setSelectedUser(null);
    try {
      const res = await API.get(`/team/find-by-email?email=${encodeURIComponent(emailInput.trim())}`);
      setSelectedUser(res.data.user);
    } catch (err) {
      setEmailSearchError(err.response?.data?.message || 'User not found with that email');
    } finally {
      setEmailSearchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !projectId) return;

    const result = await dispatch(addMemberToProjectAsync({ projectId, userId: selectedUser._id }));
    if (addMemberToProjectAsync.fulfilled.match(result)) {
      setSuccessMsg(`${selectedUser.username} has been added to the project!`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add Teammate</h2>
              <p className="text-slate-500 text-sm font-medium">Search by name or find by email address.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm font-bold">
              <CheckCircle2 size={18} />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name/username search */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search by Name or Username</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Type name or username..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSelectedUser(null); }}
                />
              </div>
              {searchQuery.trim() && (
                <div className="max-h-40 overflow-y-auto bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-50">
                  {filteredMembers.length > 0 ? filteredMembers.map(member => (
                    <div
                      key={member._id}
                      onClick={() => { setSelectedUser(member); setSearchQuery(member.username); setEmailInput(''); setEmailSearchError(''); }}
                      className={`p-4 flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-colors ${selectedUser?._id === member._id ? 'bg-indigo-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none">{member.username}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{member.email}</p>
                        </div>
                      </div>
                      {selectedUser?._id === member._id && <CheckCircle2 size={18} className="text-indigo-600" />}
                    </div>
                  )) : (
                    <div className="p-6 text-center text-slate-400 text-xs font-medium">No users found</div>
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or find by email</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            {/* Email lookup */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="user@company.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                    value={emailInput}
                    onChange={(e) => { setEmailInput(e.target.value); setEmailSearchError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleFindByEmail())}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFindByEmail}
                  disabled={emailSearchLoading || !emailInput.trim()}
                  className="px-4 py-3.5 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all disabled:opacity-40 flex items-center gap-2"
                >
                  {emailSearchLoading ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
                  Find
                </button>
              </div>
              {emailSearchError && (
                <p className="text-xs text-rose-500 font-bold ml-2 flex items-center gap-1">
                  <AlertCircle size={12} /> {emailSearchError}
                </p>
              )}
              {selectedUser && emailInput && !searchQuery && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-black text-slate-900">{selectedUser.username}</p>
                    <p className="text-[10px] text-slate-500">{selectedUser.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Role selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Role</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                <select
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:bg-white focus:border-indigo-100 outline-none transition-all cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Button type="button" variant="secondary" className="flex-1 py-4 rounded-2xl" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-[2] py-4 rounded-2xl shadow-lg shadow-indigo-100"
                disabled={!selectedUser}
              >
                <UserPlus size={18} className="mr-2" />
                Add to Project
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
