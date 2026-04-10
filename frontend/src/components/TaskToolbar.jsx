import React from 'react';
import { Search, Filter, ArrowUpDown, Plus } from 'lucide-react';

const TaskToolbar = ({ onSearch, onFilter, onSort, onAddTaskClick, showAddButton = true }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border-b border-slate-100 sticky top-0 z-10">
      <div className="flex flex-1 items-center gap-4 max-w-2xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search tasks, descriptions..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <ArrowUpDown size={16} />
            <span>Sort</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
       
        {showAddButton && (
          <button
            onClick={onAddTaskClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>New Task</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskToolbar;
