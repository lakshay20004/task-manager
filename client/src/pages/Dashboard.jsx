import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  TrendingUp,
  ArrowRight,
  Loader2,
  CalendarDays,
  FolderKanban,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/tasks/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  const formatDate = (date) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status, dueDate) => {
    if (status !== 'done' && isOverdue(dueDate)) {
      return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold status-overdue">Overdue</span>;
    }
    const styles = {
      todo: 'status-todo',
      'in-progress': 'status-in-progress',
      done: 'status-done',
    };
    const labels = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPriorityDot = (priority) => {
    const colors = { high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-green-500' };
    return <span className={`w-2 h-2 rounded-full ${colors[priority] || 'bg-surface-300'}`} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats?.counts?.total || 0,
      icon: ListTodo,
      color: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20',
    },
    {
      label: 'In Progress',
      value: stats?.counts?.['in-progress'] || 0,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/20',
    },
    {
      label: 'Completed',
      value: stats?.counts?.done || 0,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-green-600',
      shadow: 'shadow-emerald-500/20',
    },
    {
      label: 'Overdue',
      value: stats?.overdueTasks?.length || 0,
      icon: AlertTriangle,
      color: 'from-red-500 to-rose-600',
      shadow: 'shadow-red-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">
          Welcome back, <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-surface-500 mt-1">Here's what's happening across your projects.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className={`bg-white rounded-2xl p-5 border border-surface-100 hover:shadow-lg ${card.shadow} transition-all duration-300 hover:-translate-y-1 animate-fade-in-up`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.shadow}`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-surface-300" />
            </div>
            <p className="text-3xl font-bold text-surface-900">{card.value}</p>
            <p className="text-sm text-surface-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
            <h2 className="font-bold text-surface-900 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-primary-500" />
              My Active Tasks
            </h2>
            <Link to="/my-tasks" className="text-xs font-semibold text-primary-600 hover:text-primary-500 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-surface-50">
            {stats?.myTasks?.length > 0 ? (
              stats.myTasks.slice(0, 5).map((task) => (
                <div key={task._id} className="px-6 py-3.5 hover:bg-surface-50/50 transition-colors flex items-center gap-3">
                  {getPriorityDot(task.priority)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{task.title}</p>
                    <p className="text-xs text-surface-400 mt-0.5">{task.project?.name}</p>
                  </div>
                  {getStatusBadge(task.status, task.dueDate)}
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center">
                <CheckCircle2 className="w-10 h-10 text-surface-200 mx-auto mb-3" />
                <p className="text-sm text-surface-400">No active tasks — you're all caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Overdue / Recent */}
        <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
            <h2 className="font-bold text-surface-900 flex items-center gap-2">
              {stats?.overdueTasks?.length > 0 ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Overdue Tasks
                </>
              ) : (
                <>
                  <CalendarDays className="w-5 h-5 text-primary-500" />
                  Recent Tasks
                </>
              )}
            </h2>
          </div>
          <div className="divide-y divide-surface-50">
            {(stats?.overdueTasks?.length > 0 ? stats.overdueTasks : stats?.recentTasks || [])
              .slice(0, 5)
              .map((task) => (
                <div key={task._id} className="px-6 py-3.5 hover:bg-surface-50/50 transition-colors flex items-center gap-3">
                  {getPriorityDot(task.priority)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-surface-400">{task.project?.name}</span>
                      {task.dueDate && (
                        <>
                          <span className="text-surface-300">·</span>
                          <span className={`text-xs ${isOverdue(task.dueDate) && task.status !== 'done' ? 'text-red-500 font-medium' : 'text-surface-400'}`}>
                            {formatDate(task.dueDate)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(task.status, task.dueDate)}
                </div>
              ))}
            {(!stats?.overdueTasks?.length && !stats?.recentTasks?.length) && (
              <div className="px-6 py-10 text-center">
                <FolderKanban className="w-10 h-10 text-surface-200 mx-auto mb-3" />
                <p className="text-sm text-surface-400">No tasks yet. Create a project to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center gap-4 text-white">
          <FolderKanban className="w-8 h-8 opacity-80" />
          <div>
            <p className="font-bold text-lg">{stats?.totalProjects || 0} Active Projects</p>
            <p className="text-white/60 text-sm">Keep up the great work!</p>
          </div>
        </div>
        <Link
          to="/projects"
          className="px-6 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
        >
          View Projects <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
