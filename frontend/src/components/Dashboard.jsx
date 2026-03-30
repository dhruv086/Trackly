import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ProjectOverview from './ProjectOverview';
import MetricCard from './MetricCard';
import TaskCharts from './TaskCharts';
import TeamSection from './TeamSection';
import ActivityTimeline from './ActivityTimeline';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Layers
} from 'lucide-react';

const Dashboard = () => {
  const metrics = [
    { title: 'Total Tasks', value: '124', icon: Layers, color: 'bg-indigo-500', trend: 'up', trendValue: '12' },
    { title: 'Completed', value: '86', icon: CheckSquare, color: 'bg-emerald-500', trend: 'up', trendValue: '8' },
    { title: 'Pending', value: '32', icon: Clock, color: 'bg-amber-500', trend: 'down', trendValue: '3' },
    { title: 'Overdue', value: '6', icon: AlertCircle, color: 'bg-rose-500', trend: 'up', trendValue: '5' },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 space-y-8 overflow-y-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Workspace / Overview</p>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Updated 1 hour ago
              </span>
            </div>
          </div>

          {/* Project Overview Card */}
          <ProjectOverview />

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, idx) => (
              <MetricCard key={idx} {...metric} />
            ))}
          </div>

          {/* Visualization Section */}
          <TaskCharts />

          {/* Bottom Grid: Team and Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1">
              <TeamSection />
            </div>
            <div className="xl:col-span-2">
              <ActivityTimeline />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
