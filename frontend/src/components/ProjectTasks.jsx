import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, selectTask, clearSelectedTask } from '../store/slices/taskSlice';
import {
  Search,
  Filter,
  MoreVertical,
  Clock,
  CheckCircle2,
  Plus,
  AlertCircle
} from 'lucide-react';
import Button from './ui/Button';
import TaskDetailDrawer from './TaskDetailDrawer';
import AddTaskModal from './AddTaskModal';

const ProjectTasks = ({ projectId }) => {
  const dispatch = useDispatch();
  const { tasks: allTasks, loading, selectedTaskId } = useSelector((state) => state.tasks);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasks(projectId));
    }
  }, [dispatch, projectId]);

  const projectTasks = Object.values(allTasks).filter(task =>
    task.project === projectId || task.project?._id === projectId
  );

  const filteredTasks = projectTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTask = selectedTaskId ? allTasks[selectedTaskId] : null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'In Progress': return <Clock size={16} className="text-indigo-500" />;
      case 'Review': return <AlertCircle size={16} className="text-amber-500" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-slate-300" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Filter tasks by name, description..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-[1.25rem] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="secondary" size="md" className="rounded-2xl">
            <Filter size={18} className="mr-2" />
            Advanced Filter
          </Button>
        </div>
        <Button variant="primary" size="md" className="rounded-2xl shadow-lg shadow-indigo-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} className="mr-2" />
          Add Task
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignee</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-medium">Loading project tasks...</td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-slate-400 font-medium">No tasks found for this project</p>
                      <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(true)}>Create your first task</Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => dispatch(selectTask(task.id))}
                  >
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {getStatusIcon(task.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                        <p className="text-xs text-slate-400 font-medium line-clamp-1">{task.description || 'No description'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-600">
                          {task.assignees?.[0]?.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{task.assignees?.[0]?.username || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px]">
                        <Clock size={14} />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Set Date'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TaskDetailDrawer
        task={selectedTask}
        isOpen={Boolean(selectedTaskId)}
        onClose={() => dispatch(clearSelectedTask())}
      />
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default ProjectTasks;
