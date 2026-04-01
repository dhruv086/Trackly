import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMembers } from '../../store/slices/teamSlice';
import { fetchProjects } from '../../store/slices/projectSlice';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/ui/Button';
import InviteModal from '../../components/InviteModal';
import CreateProjectModal from '../../components/CreateProjectModal';
import AIEvaluationModal from '../../components/AIEvaluationModal';
import { fetchAIEvaluation } from '../../store/slices/teamSlice';
import {
  Users,
  Search,
  UserPlus,
  MoreVertical,
  Mail,
  Shield,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  Layout,
  ArrowRight
} from 'lucide-react';

const TeamManagement = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { members: teamMembers, invitations, loading: teamLoading } = useSelector((state) => state.team);
  const { items: projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedAIUser, setSelectedAIUser] = useState(null);

  const handleGenerateAIReport = (user) => {
    setSelectedAIUser(user);
    dispatch(fetchAIEvaluation(user._id));
    setIsAIModalOpen(true);
  };

  useEffect(() => {
    dispatch(fetchMembers());
    dispatch(fetchProjects());
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="p-8 space-y-8 h-full flex flex-col">
        {!selectedProject ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team Directory</h1>
                <p className="text-slate-400 font-medium">Select a project to manage its specific collaborator team</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => setSelectedProject(project)}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 hover:border-indigo-100 transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Layout size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{project.name}</h3>
                  <div className="flex items-center justify-between mt-8">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-slate-300" />
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{project.members?.length || 0} Members</span>
                    </div>
                    <ArrowRight size={20} className="text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}

              <div
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="bg-slate-50/50 border-2 border-dashed border-slate-100 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4 hover:bg-white hover:border-indigo-100 transition-all group cursor-pointer"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-200 shadow-sm group-hover:text-indigo-300 transition-colors">
                  <UserPlus size={28} />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">New Project</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{selectedProject.name} Team</h1>
                  <p className="text-slate-400 font-medium">Managing {selectedProject.members?.length || 0} collaborators for this project</p>
                </div>
              </div>
              <Button variant="primary" onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus size={18} className="mr-2" />
                Add Member
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
              <div className="lg:col-span-3 space-y-6 flex flex-col h-full overflow-hidden">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Search within this project..."
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Collaborator</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(selectedProject.members || []).map((member) => (
                        <tr key={member._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-100 overflow-hidden border-2 border-white">
                                {member.avatar ? <img src={member.avatar} alt="avatar" className="w-full h-full object-cover" /> : (member.username || '??').split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{member.username}</p>
                                <p className="text-[11px] text-slate-400 font-bold tracking-tight">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                              {member.role || 'Member'}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.05em]">Online</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              {currentUser?.role === 'Admin' && (
                                <button 
                                  onClick={() => handleGenerateAIReport(member)}
                                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 border border-indigo-100 font-black text-[10px] uppercase tracking-widest rounded-lg transition-colors flex items-center gap-1.5"
                                  title="Generate AI Productivity Report"
                                >
                                  ✨ AI Report
                                </button>
                              )}
                              <button className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100">
                                <MoreVertical size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                  <Shield size={40} className="mb-6 text-indigo-200" />
                  <h3 className="text-2xl font-black mb-3 tracking-tight">Security First</h3>
                  <p className="text-indigo-100/80 text-sm font-medium leading-relaxed mb-8">
                    Control permissions at the project level to maintain data integrity.
                  </p>
                  <Button className="bg-white text-indigo-600 hover:bg-indigo-50 py-4 w-full rounded-2xl font-black uppercase tracking-widest text-xs">Manage Access</Button>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Pending Requests</h3>
                  <div className="space-y-4 text-center py-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail size={20} className="text-slate-200" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No pending invites</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={selectedProject?._id}
      />

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
      />

      <AIEvaluationModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        user={selectedAIUser}
      />
    </MainLayout>
  );
};

export default TeamManagement;
