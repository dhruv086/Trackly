import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, Clock, Target, Loader2 } from 'lucide-react';
import API from '../utils/api';

const ProjectOverview = ({ projectId } = {}) => {
  const { items: projects, currentProject } = useSelector((state) => state.projects);
  // If a specific projectId is provided (e.g. from ProjectDashboard), use that project;
  // otherwise fall back to the first Active project (used on GlobalDashboard).
  const activeProject = projectId
    ? (currentProject?._id === projectId ? currentProject : projects.find(p => p._id === projectId)) || projects.find(p => p.status === 'Active') || projects[0]
    : projects.find(p => p.status === 'Active') || projects[0];

  // Local state for task counts — fetched directly for the active project
  const [counts, setCounts] = useState({ total: 0, done: 0, loaded: false });

  useEffect(() => {
    if (!activeProject?._id) return;
    setCounts({ total: 0, done: 0, loaded: false });
    API.get(`/tasks/project/${activeProject._id}`)
      .then((res) => {
        const tasks = res.data.tasks || [];
        const done = tasks.filter(
          t => String(t.columnId) === 'done' || String(t.status).toLowerCase() === 'done'
        ).length;
        setCounts({ total: tasks.length, done, loaded: true });
      })
      .catch(() => {
        setCounts({ total: 0, done: 0, loaded: true });
      });
  }, [activeProject?._id]);

  if (!activeProject) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center h-full">
        <p className="text-slate-400 font-medium italic">No active projects to display</p>
      </div>
    );
  }

  const { total, done, loaded } = counts;
  const progress = loaded
    ? (total > 0 ? Math.round((done / total) * 100) : 0)
    : (activeProject.progress || 0);

  const deadline  = activeProject.deadline ? new Date(activeProject.deadline).toLocaleDateString() : 'N/A';
  const startDate = new Date(activeProject.createdAt).toLocaleDateString();

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">
            {activeProject.status || 'Active'} Project
          </span>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">{activeProject.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm max-w-lg line-clamp-2">
            {activeProject.description || 'No description provided'}
          </p>
        </div>
        <div className="flex -space-x-3">
          {activeProject.members?.slice(0, 4).map((member, i) => (
            <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
              {member.username?.[0]?.toUpperCase() || '?'}
            </div>
          ))}
          {activeProject.members?.length > 4 && (
            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-50 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
              +{activeProject.members.length - 4}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-sm">
        <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
          <Calendar size={18} className="text-indigo-500" />
          <div>
            <p className="text-slate-400 dark:text-slate-500 text-xs uppercase font-semibold">Start Date</p>
            <p className="font-bold dark:text-slate-200">{startDate}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
          <Clock size={18} className="text-rose-500" />
          <div>
            <p className="text-slate-400 dark:text-slate-500 text-xs uppercase font-semibold">Deadline</p>
            <p className="font-bold dark:text-slate-200">{deadline}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
          <Target size={18} className="text-emerald-500" />
          <div>
            <p className="text-slate-400 dark:text-slate-500 text-xs uppercase font-semibold">Tasks Done</p>
            <p className="font-bold dark:text-slate-200">
              {loaded ? `${done} / ${total}` : '…'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Project Progress</span>
          <div className="flex items-center gap-2">
            {!loaded && <Loader2 size={12} className="animate-spin text-slate-400" />}
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
          </div>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-700 ease-out shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40"
            style={{ width: `${progress}%` }}
          />
        </div>
        {loaded && total > 0 && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1.5">
            {done} of {total} tasks completed
          </p>
        )}
        {loaded && total === 0 && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1.5">
            No tasks in this project yet
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectOverview;
