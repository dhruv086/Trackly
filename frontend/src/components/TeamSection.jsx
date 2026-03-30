import React, { useState } from 'react';
import { MoreVertical, Mail, UserPlus, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { removeMemberFromProjectAsync } from '../store/slices/teamSlice';
import InviteModal from './InviteModal';
import Button from './ui/Button';

const TeamSection = ({ projectId, members: projectMembers = [] }) => {
  const dispatch = useDispatch();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleRemoveMember = (userId) => {
    if (window.confirm('Are you sure you want to remove this member from the project?')) {
      dispatch(removeMemberFromProjectAsync({ projectId, userId }));
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Project Team</h3>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-1">
            {projectMembers.length} {projectMembers.length === 1 ? 'Collaborator' : 'Collaborators'}
          </p>
        </div>
        <button className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-all">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {projectMembers.map((member, index) => (
          <div key={member._id || index} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 border-2 border-white overflow-hidden">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.username} className="w-full h-full object-cover" />
                  ) : (
                    (member.username || '??').split(' ').map(n => n[0]).join('').toUpperCase()
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-lg bg-emerald-500 shadow-sm"></div>
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                  {member.username}
                </h4>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">
                  {member.role || 'Member'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
              <button
                className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="Send Message"
              >
                <Mail size={16} />
              </button>
              <button
                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                title="Remove Member"
                onClick={() => handleRemoveMember(member._id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {projectMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
              <UserPlus size={32} />
            </div>
            <p className="text-sm font-bold text-slate-400">No team members yet</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsInviteModalOpen(true)}
        className="w-full mt-8 py-4 border-2 border-dashed border-slate-100 rounded-[1.5rem] text-slate-400 text-sm font-black uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-center gap-2">
          <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
          Add Member
        </div>
      </button>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={projectId}
      />
    </div>
  );
};

export default TeamSection;
