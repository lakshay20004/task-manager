import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Loader2, CheckSquare, Calendar, Flag, Clock, CheckCircle2,
  ListTodo, User, Users, ArrowRight,
} from 'lucide-react';

const MyTasks = () => {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('all'); // 'all' or 'mine'
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks/all');
      setAllTasks(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status });
      setAllTasks(allTasks.map(t => t._id === taskId ? { ...t, status: res.data.status } : t));
    } catch (err) { console.error(err); }
  };

  const isOverdue = (d) => d && new Date(d) < new Date();
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  // Filter by view (all vs mine)
  const viewFiltered = view === 'mine'
    ? allTasks.filter(t => t.assignee?._id === user?._id)
    : allTasks;

  // Filter by status
  const tasks = statusFilter === 'all'
    ? viewFiltered
    : viewFiltered.filter(t => t.status === statusFilter);

  const todoTasks = viewFiltered.filter(t => t.status === 'todo');
  const inProgressTasks = viewFiltered.filter(t => t.status === 'in-progress');
  const doneTasks = viewFiltered.filter(t => t.status === 'done');

  const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  const priorityBg = { high: '#fef2f2', medium: '#fffbeb', low: '#f0fdf4' };

  const getInitials = (n) => n?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Loader2 style={{ width: '2rem', height: '2rem', color: '#6366f1', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const TaskCard = ({ task }) => (
    <div
      style={{
        background: 'white', borderRadius: '0.75rem', padding: '1rem',
        border: '1px solid #f1f5f9', marginBottom: '0.75rem',
        transition: 'all 0.2s', cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Priority + Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{
          width: '0.5rem', height: '0.5rem', borderRadius: '9999px', marginTop: '0.4rem', flexShrink: 0,
          background: priorityColors[task.priority] || '#94a3b8',
        }} />
        <h4 style={{
          fontWeight: 600, fontSize: '0.875rem', color: '#1e293b', flex: 1,
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
          opacity: task.status === 'done' ? 0.5 : 1,
        }}>
          {task.title}
        </h4>
      </div>

      {/* Description */}
      {task.description && (
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', marginLeft: '1rem' }}>
          {task.description.length > 80 ? task.description.slice(0, 80) + '...' : task.description}
        </p>
      )}

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Project name */}
          <Link
            to={`/projects/${task.project?._id}`}
            style={{
              fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '0.375rem',
              background: '#eef2ff', color: '#4f46e5', fontWeight: 600, textDecoration: 'none',
            }}
          >
            {task.project?.name}
          </Link>

          {/* Due date */}
          {task.dueDate && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem',
              color: isOverdue(task.dueDate) && task.status !== 'done' ? '#ef4444' : '#94a3b8',
              fontWeight: isOverdue(task.dueDate) && task.status !== 'done' ? 600 : 400,
            }}>
              <Calendar style={{ width: '0.625rem', height: '0.625rem' }} />
              {formatDate(task.dueDate)}
            </span>
          )}

          {/* Priority badge */}
          <span style={{
            fontSize: '0.625rem', padding: '0.125rem 0.375rem', borderRadius: '0.25rem',
            background: priorityBg[task.priority], color: priorityColors[task.priority],
            fontWeight: 600, textTransform: 'capitalize',
          }}>
            {task.priority}
          </span>
        </div>

        {/* Assignee avatar */}
        {task.assignee && (
          <div
            title={task.assignee.name}
            style={{
              width: '1.5rem', height: '1.5rem', borderRadius: '9999px',
              background: 'linear-gradient(135deg, #818cf8, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '0.5rem', fontWeight: 700,
            }}
          >
            {getInitials(task.assignee.name)}
          </div>
        )}
      </div>

      {/* Status changer */}
      <div style={{ marginTop: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
        <select
          value={task.status}
          onChange={e => handleStatusChange(task._id, e.target.value)}
          style={{
            width: '100%', padding: '0.375rem 0.5rem', borderRadius: '0.5rem',
            border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.75rem',
            fontWeight: 500, color: '#475569', cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="todo">📋 To Do</option>
          <option value="in-progress">🔄 In Progress</option>
          <option value="done">✅ Done</option>
        </select>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckSquare style={{ width: '1.75rem', height: '1.75rem', color: '#6366f1' }} /> My Tasks
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
          Track and manage tasks across all your projects.
        </p>
      </div>

      {/* View Toggle + Status Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }} className="animate-fade-in-up">
        {/* View toggle */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '0.75rem', padding: '0.25rem' }}>
          <button onClick={() => setView('all')} style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '0.625rem',
            fontSize: '0.8125rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            background: view === 'all' ? 'white' : 'transparent',
            color: view === 'all' ? '#0f172a' : '#64748b',
            boxShadow: view === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}>
            <Users style={{ width: '0.875rem', height: '0.875rem' }} /> All Tasks
          </button>
          <button onClick={() => setView('mine')} style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '0.625rem',
            fontSize: '0.8125rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            background: view === 'mine' ? 'white' : 'transparent',
            color: view === 'mine' ? '#0f172a' : '#64748b',
            boxShadow: view === 'mine' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}>
            <User style={{ width: '0.875rem', height: '0.875rem' }} /> Assigned to Me
          </button>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '1.5rem', background: '#e2e8f0' }} />

        {/* Status filters */}
        {[
          { v: 'all', l: 'All', count: viewFiltered.length },
          { v: 'todo', l: 'To Do', count: todoTasks.length },
          { v: 'in-progress', l: 'In Progress', count: inProgressTasks.length },
          { v: 'done', l: 'Done', count: doneTasks.length },
        ].map(f => (
          <button key={f.v} onClick={() => setStatusFilter(f.v)} style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
            fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
            background: statusFilter === f.v ? '#6366f1' : 'white',
            color: statusFilter === f.v ? 'white' : '#475569',
            border: statusFilter === f.v ? '1px solid #6366f1' : '1px solid #e2e8f0',
            boxShadow: statusFilter === f.v ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
          }}>
            {f.l} <span style={{ fontWeight: 700 }}>({f.count})</span>
          </button>
        ))}
      </div>

      {/* Kanban Board View */}
      {statusFilter === 'all' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', minHeight: '50vh' }}
          className="animate-fade-in-up"
        >
          {/* To Do Column */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem',
              padding: '0.625rem 0.875rem', borderRadius: '0.75rem', background: '#dbeafe',
            }}>
              <ListTodo style={{ width: '1rem', height: '1rem', color: '#1d4ed8' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1d4ed8' }}>To Do</span>
              <span style={{
                marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8',
                background: 'white', padding: '0.125rem 0.5rem', borderRadius: '9999px',
              }}>{todoTasks.length}</span>
            </div>
            <div>
              {todoTasks.length > 0 ? todoTasks.map(t => <TaskCard key={t._id} task={t} />) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.8125rem' }}>
                  No to-do tasks
                </div>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem',
              padding: '0.625rem 0.875rem', borderRadius: '0.75rem', background: '#fef3c7',
            }}>
              <Clock style={{ width: '1rem', height: '1rem', color: '#b45309' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#b45309' }}>In Progress</span>
              <span style={{
                marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: '#b45309',
                background: 'white', padding: '0.125rem 0.5rem', borderRadius: '9999px',
              }}>{inProgressTasks.length}</span>
            </div>
            <div>
              {inProgressTasks.length > 0 ? inProgressTasks.map(t => <TaskCard key={t._id} task={t} />) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.8125rem' }}>
                  No tasks in progress
                </div>
              )}
            </div>
          </div>

          {/* Done Column */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem',
              padding: '0.625rem 0.875rem', borderRadius: '0.75rem', background: '#d1fae5',
            }}>
              <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#047857' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#047857' }}>Done</span>
              <span style={{
                marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: '#047857',
                background: 'white', padding: '0.125rem 0.5rem', borderRadius: '9999px',
              }}>{doneTasks.length}</span>
            </div>
            <div>
              {doneTasks.length > 0 ? doneTasks.map(t => <TaskCard key={t._id} task={t} />) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.8125rem' }}>
                  No completed tasks
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View when a specific status filter is selected */
        <div className="animate-fade-in-up" style={{ maxWidth: '48rem' }}>
          {tasks.length > 0 ? tasks.map(t => <TaskCard key={t._id} task={t} />) : (
            <div style={{
              textAlign: 'center', padding: '4rem 1rem', background: 'white',
              borderRadius: '1rem', border: '1px solid #f1f5f9',
            }}>
              <CheckCircle2 style={{ width: '3rem', height: '3rem', color: '#e2e8f0', margin: '0 auto 0.75rem' }} />
              <p style={{ color: '#94a3b8', fontSize: '0.9375rem' }}>No tasks with this status</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state when no tasks at all */}
      {allTasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }} className="animate-fade-in-up">
          <CheckSquare style={{ width: '4rem', height: '4rem', color: '#e2e8f0', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>No tasks yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Create a project and add tasks to start tracking your work.
          </p>
          <Link to="/projects" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.625rem 1.25rem', borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #6366f1, #4338ca)', color: 'white',
            fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
          }}>
            Go to Projects <ArrowRight style={{ width: '1rem', height: '1rem' }} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
