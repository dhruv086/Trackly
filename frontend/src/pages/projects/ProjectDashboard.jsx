import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../../layouts/MainLayout';
import ProjectOverview from '../../components/ProjectOverview';
import TaskCharts from '../../components/TaskCharts';
import TeamSection from '../../components/TeamSection';
import ActivityTimeline from '../../components/ActivityTimeline';
import AttachmentsPanel from '../../components/AttachmentsPanel';
import ChatBox from '../../components/ChatBox';
import Button from '../../components/ui/Button';
import ProjectTasks from '../../components/ProjectTasks';
import ProjectBoard from '../../components/ProjectBoard';
import AddTaskModal from '../../components/AddTaskModal';
import {
  Plus, Share2, ChevronLeft, Layout,
  CheckCircle2, Users2, TrendingUp, Paperclip,
  MessageCircle, ChevronDown, CheckCheck, Pause, Clock, AlertTriangle, Flame
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectById, clearCurrentProject, updateProjectAsync } from '../../store/slices/projectSlice';
import { fetchTasks } from '../../store/slices/taskSlice';
import {
  fetchProjectAttachments,
  uploadProjectAttachment,
  deleteProjectAttachment,
  markProjectAttachmentViewed,
} from '../../store/slices/attachmentSlice';

const PROJECT_STATUSES = [
  { value: 'Active',    label: 'Active',    icon: Flame,        colors: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' },
  { value: 'On Hold',  label: 'On Hold',   icon: Pause,        colors: 'bg-amber-50 text-amber-600 border-amber-200',   dot: 'bg-amber-400' },
  { value: 'Review',   label: 'Review',    icon: Clock,        colors: 'bg-blue-50 text-blue-600 border-blue-200',       dot: 'bg-blue-400' },
  { value: 'Completed',label: 'Completed', icon: CheckCheck,   colors: 'bg-indigo-50 text-indigo-600 border-indigo-200', dot: 'bg-indigo-500' },
  { value: 'Delayed',  label: 'Delayed',   icon: AlertTriangle, colors: 'bg-rose-50 text-rose-600 border-rose-200',       dot: 'bg-rose-500' },
];

const ProjectDashboard = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProject: project, loading } = useSelector((state) => state.projects);
  const { tasks: allTasks } = useSelector((state) => state.tasks);
  const { byProject, uploading } = useSelector((state) => state.attachments);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const statusRef = useRef(null);

  const taskList = Object.values(allTasks).filter(
    t => (t.project === id || t.project?._id === id)
  );
  const completedCount = taskList.filter(
    t => String(t.columnId) === 'done' || String(t.status).toLowerCase() === 'done'
  ).length;
  const activeMembersCount = project?.members?.length || 0;
  const completionRate = taskList.length > 0 ? Math.round((completedCount / taskList.length) * 100) : 0;

  const projectAttachments = byProject[id] || [];

  const currentStatusConfig = PROJECT_STATUSES.find(s => s.value === (project?.status || 'Active')) || PROJECT_STATUSES[0];

  // Close status dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleStatusChange = async (newStatus) => {
    if (!project || newStatus === project.status) { setStatusOpen(false); return; }
    setUpdatingStatus(true);
    setStatusOpen(false);
    await dispatch(updateProjectAsync({ projectId: id, status: newStatus }));
    setUpdatingStatus(false);
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      dispatch(fetchTasks(id));
    }
    return () => dispatch(clearCurrentProject());
  }, [dispatch, id]);

  // Load attachments when Files tab is activated
  useEffect(() => {
    if (activeTab === 'Files' && id) {
      dispatch(fetchProjectAttachments(id));
    }
  }, [activeTab, id, dispatch]);

  const tabs = ['Overview', 'Tasks', 'Board', 'Team', 'Chat', 'Files', 'Settings'];

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Project Header */}
        <div className="flex flex-col gap-6">
          <Link to="/projects" className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all">
            <ChevronLeft size={16} />
            Back to Projects
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100 flex-shrink-0">
                <Layout size={32} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">{project?.name || 'Project Loading...'}</h1>

                  {/* ── Status dropdown ─────────────────────── */}
                  <div ref={statusRef} className="relative">
                    <button
                      onClick={() => setStatusOpen((o) => !o)}
                      disabled={updatingStatus || !project}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all hover:shadow-md disabled:opacity-60 ${currentStatusConfig.colors}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${currentStatusConfig.dot} ${updatingStatus ? 'animate-pulse' : ''}`} />
                      {updatingStatus ? 'Saving…' : currentStatusConfig.label}
                      <ChevronDown size={11} className={`transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {statusOpen && (
                      <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/80 overflow-hidden min-w-[160px]">
                        {PROJECT_STATUSES.map((s) => {
                          const SIcon = s.icon;
                          const isCurrent = s.value === project?.status;
                          return (
                            <button
                              key={s.value}
                              onClick={() => handleStatusChange(s.value)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-left transition-colors hover:bg-slate-50 ${
                                isCurrent ? 'text-indigo-600' : 'text-slate-700'
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                              {s.label}
                              {isCurrent && <CheckCheck size={13} className="ml-auto text-indigo-400" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-slate-400 font-medium">{loading ? 'Loading description...' : (project?.description || 'No description provided')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="md" className="rounded-2xl">
                <Share2 size={18} className="mr-2" />
                Share
              </Button>
              <Button variant="primary" size="md" className="rounded-2xl shadow-lg shadow-indigo-100" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={18} className="mr-2" />
                New Task
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm w-fit overflow-x-auto custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                  ${activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="xl:col-span-2 space-y-8">
              <ProjectOverview projectId={id} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Tasks Completed', value: completedCount.toString(), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { label: 'Active Members', value: activeMembersCount.toString(), icon: Users2, color: 'text-purple-500', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 transition-all hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 group">
                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <stat.icon size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <TaskCharts />
            </div>

            <div className="space-y-8">
              <TeamSection projectId={id} members={project?.members} />
              <ActivityTimeline />
            </div>
          </div>
        )}

        {activeTab === 'Team' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[600px]">
            <TeamSection projectId={id} members={project?.members} />
          </div>
        )}

        {activeTab === 'Tasks' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProjectTasks projectId={id} />
          </div>
        )}

        {activeTab === 'Board' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProjectBoard projectId={id} />
          </div>
        )}

        {activeTab === 'Chat' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <MessageCircle size={17} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Project Chat</h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {project?.members?.length || 0} member{(project?.members?.length || 0) !== 1 ? 's' : ''} · Real-time
                  </p>
                </div>
              </div>
              <div className="flex flex-col" style={{ height: 'calc(100% - 65px)' }}>
                <ChatBox mode="project" contextId={id} members={project?.members || []} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Files' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Paperclip size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Project Files</h2>
                  <p className="text-xs text-slate-400 font-medium">{projectAttachments.length} file{projectAttachments.length !== 1 ? 's' : ''} · All file types · No size limit</p>
                </div>
              </div>
              <AttachmentsPanel
                attachments={projectAttachments}
                uploading={uploading}
                onUpload={(file) => dispatch(uploadProjectAttachment({ projectId: id, file }))}
                onDelete={(attachmentId) => dispatch(deleteProjectAttachment({ projectId: id, attachmentId }))}
                onView={(attachmentId) => dispatch(markProjectAttachmentViewed({ projectId: id, attachmentId }))}
                currentUser={currentUser}
                mode="project"
                members={project?.members || []}
              />
            </div>
          </div>
        )}

        {!['Overview', 'Tasks', 'Board', 'Team', 'Chat', 'Files'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
              <Layout size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Workspace Preparation</h3>
            <p className="text-slate-400 font-medium text-center max-w-sm mb-8">
              We are currently preparing the <span className="text-indigo-600 font-bold">{activeTab}</span> module for this project. Check back soon!
            </p>
            <Button variant="outline" onClick={() => setActiveTab('Overview')}>Return to Overview</Button>
          </div>
        )}
      </div>
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </MainLayout>
  );
};

export default ProjectDashboard;
