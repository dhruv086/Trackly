import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProjects } from '../../store/slices/projectSlice';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/ui/Button';
import {
  LayoutGrid,
  List as ListIcon,
  Search,
  Plus,
  MoreVertical,
  Calendar,
  Layers
} from 'lucide-react';
import CreateProjectModal from '../../components/CreateProjectModal';

const ProjectCard = ({ project, viewType }) => {
  const statusColors = {
    Active: 'bg-indigo-50 text-indigo-600',
    Delayed: 'bg-rose-50 text-rose-600',
    Review: 'bg-amber-50 text-amber-600',
    Completed: 'bg-emerald-50 text-emerald-600',
  };

  const progress = project.progress || 0;
  const membersCount = project.members?.length || 0;
  const deadline = project.deadline || project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A';

  if (viewType === 'grid') {
    return (
      <Link to={`/projects/${project._id}`} className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group block">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            <Layers size={24} />
          </div>
          <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <MoreVertical size={18} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{project.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-6 h-10">{project.description || 'No description provided'}</p>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-bold mb-1">
            <span className="text-slate-400 uppercase tracking-wider">Progress</span>
            <span className="text-indigo-600">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex -space-x-2">
            {[...Array(Math.min(membersCount, 3))].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                {project.members[i]?.username?.[0] || '?'}
              </div>
            ))}
            {membersCount > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                +{membersCount - 3}
              </div>
            )}
          </div>
          <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${statusColors[project.status] || statusColors.Active}`}>
            {project.status || 'Active'}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/projects/${project._id}`} className="bg-white p-4 rounded-2xl border border-slate-100 hover:bg-slate-50/50 transition-all flex items-center gap-6 block hover:shadow-sm">
      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
        <Layers size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-slate-900 truncate">{project.name}</h3>
        <p className="text-xs text-slate-400 truncate">{project.description || 'No description provided'}</p>
      </div>
      <div className="hidden md:block w-32">
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-indigo-600 h-full" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="hidden lg:flex items-center gap-2 w-32">
        <Calendar size={14} className="text-slate-400" />
        <span className="text-xs font-medium text-slate-500">{deadline}</span>
      </div>
      <span className={`w-24 text-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${statusColors[project.status] || statusColors.Active}`}>
        {project.status || 'Active'}
      </span>
      <button className="p-2 text-slate-300 hover:text-slate-600 rounded-xl" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        <MoreVertical size={18} />
      </button>
    </Link>
  );
};

const Projects = () => {
  const [viewType, setViewType] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const dispatch = useDispatch();
  const { items: projects, loading } = useSelector((state) => state.projects);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'All Status' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Projects</h1>
            <p className="text-slate-400 font-medium">Manage and track your organization's work</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
              <button
                onClick={() => setViewType('grid')}
                className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ListIcon size={18} />
              </button>
            </div>
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={18} className="mr-2" />
              New Project
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name, description or tag..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-[1.25rem] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-[1.25rem] text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Completed</option>
            <option>Delayed</option>
            <option>On Hold</option>
            <option>Review</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2rem] border border-slate-100">
            <Layers size={48} className="text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">
              {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
            </h3>
            <p className="text-slate-500 mb-6">
              {projects.length === 0 ? 'Create your first project to get started' : 'Try adjusting your search or filter'}
            </p>
            {projects.length === 0 && (
              <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={18} className="mr-2" />
                Create Project
              </Button>
            )}
          </div>
        ) : (
          <div className={`${viewType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8' : 'flex flex-col gap-4'}`}>
            {filteredProjects.map(project => (
              <ProjectCard key={project._id} project={project} viewType={viewType} />
            ))}
          </div>
        )}
      </div>
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </MainLayout>
  );
};

export default Projects;
