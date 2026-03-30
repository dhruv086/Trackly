import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../../store/slices/projectSlice';
import { fetchAssignedTasks, fetchAllTasks } from '../../store/slices/taskSlice';
import { fetchAnalytics } from '../../store/slices/analyticsSlice';
import MainLayout from '../../layouts/MainLayout';
import MetricCard from '../../components/MetricCard';
import ProjectOverview from '../../components/ProjectOverview';
import TaskCharts from '../../components/TaskCharts';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Layers,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import Button from '../../components/ui/Button';
import CreateProjectModal from '../../components/CreateProjectModal';

const GlobalDashboard = () => {
  const dispatch = useDispatch();
  const { items: projects } = useSelector((state) => state.projects);
  const { assignedTasks } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const { metrics, loading: analyticsLoading } = useSelector((state) => state.analytics);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchAssignedTasks());
    dispatch(fetchAllTasks());   // needed so ProjectOverview progress bar has data
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const dashboardMetrics = [
    { title: 'Total Projects', value: metrics.totalProjects.toString(), icon: Layers, color: 'bg-indigo-500', trend: 'up', trendValue: '0' },
    { title: 'Active Projects', value: metrics.activeProjects.toString(), icon: CheckSquare, color: 'bg-emerald-500', trend: 'up', trendValue: '0' },
    { title: 'Recent Deadlines', value: metrics.recentDeadlines.toString(), icon: Clock, color: 'bg-amber-500', trend: 'up', trendValue: '0' },
    { title: 'Issues', value: metrics.issues.toString(), icon: AlertCircle, color: 'bg-rose-500', trend: 'up', trendValue: '0' },
  ];

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Welcome Back, {user?.username || 'Guest'}</p>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Organization Overview</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary">
              <ArrowUpRight size={18} className="mr-2" />
              Exports
            </Button>
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={18} className="mr-2" />
              Create Project
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardMetrics.map((metric, idx) => (
            <MetricCard key={idx} {...metric} />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <ProjectOverview />
            <TaskCharts />
          </div>
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center justify-between">
                Assigned to You
                <span className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs px-2 py-1 rounded-lg">{assignedTasks.length} Pending</span>
              </h3>
              <div className="space-y-4">
                {assignedTasks.length > 0 ? (
                  assignedTasks.slice(0, 5).map((task, i) => (
                    <div key={i} className="group p-4 rounded-2xl border border-slate-50 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 hover:bg-indigo-50/10 dark:hover:bg-indigo-950/10 transition-all cursor-pointer">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{task.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{task.project?.name || 'Project'}</span>
                        <span className={`text-[10px] font-bold ${new Date(task.dueDate) < new Date() ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
                          {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
                    No tasks assigned to you yet
                  </div>
                )}
              </div>
              <Button variant="ghost" className="w-full mt-6 text-indigo-600 dark:text-indigo-400 py-3">View All My Tasks</Button>
            </div>
          </div>
        </div>
      </div>
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </MainLayout>
  );
};

export default GlobalDashboard;
