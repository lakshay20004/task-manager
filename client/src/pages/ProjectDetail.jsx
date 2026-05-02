import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  ArrowLeft, Plus, X, Loader2, Users, UserPlus, Trash2, FolderKanban,
  Calendar, Flag, Edit3, CheckCircle2, Clock, ListTodo, AlertTriangle,
} from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const isAdmin = project?.members?.find(m => (m.user?._id || m.user) === user?._id)?.role === 'admin';
  const isOverdue = (d) => d && new Date(d) < new Date();
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [pRes, tRes] = await Promise.all([api.get(`/projects/${id}`), api.get(`/tasks/project/${id}`)]);
      setProject(pRes.data); setTasks(tRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault(); setFormError(''); setFormLoading(true);
    try {
      const payload = { ...taskForm, project: id };
      if (!payload.assignee) delete payload.assignee;
      if (!payload.dueDate) delete payload.dueDate;
      const res = await api.post('/tasks', payload);
      setTasks([res.data, ...tasks]); setShowTaskForm(false);
      setTaskForm({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '' });
      fetchData();
    } catch (err) { setFormError(err.response?.data?.message || 'Failed'); }
    finally { setFormLoading(false); }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, updates);
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    } catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try { await api.delete(`/tasks/${taskId}`); setTasks(tasks.filter(t => t._id !== taskId)); }
    catch (err) { console.error(err); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault(); setFormError(''); setFormLoading(true);
    try {
      const res = await api.post(`/projects/${id}/members`, { email: memberEmail });
      setProject(res.data); setShowMemberForm(false); setMemberEmail('');
    } catch (err) { setFormError(err.response?.data?.message || 'Failed'); }
    finally { setFormLoading(false); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try { const res = await api.delete(`/projects/${id}/members/${userId}`); setProject(res.data); }
    catch (err) { console.error(err); }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const getInitials = (n) => n?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const statusOpts = [{ v: 'todo', l: 'To Do' }, { v: 'in-progress', l: 'In Progress' }, { v: 'done', l: 'Done' }];
  const priorityColors = { high: 'text-red-500', medium: 'text-amber-500', low: 'text-green-500' };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  if (!project) return <div className="text-center py-20"><p className="text-surface-500">Project not found</p></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <button onClick={() => navigate('/projects')} className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 mb-4 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Projects</button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 flex items-center gap-3"><FolderKanban className="w-7 h-7 text-primary-500" />{project.name}</h1>
            {project.description && <p className="text-surface-500 mt-1 ml-10">{project.description}</p>}
          </div>
          <div className="flex gap-2">
            {isAdmin && <button onClick={() => setShowMemberForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-200 text-surface-700 font-medium text-sm hover:bg-surface-50 transition-colors"><UserPlus className="w-4 h-4" /> Add Member</button>}
            {isAdmin && <button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-primary-500/25"><Plus className="w-4 h-4" /> New Task</button>}
          </div>
        </div>
      </div>

      {/* Members strip */}
      <div className="bg-white rounded-2xl border border-surface-100 p-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-surface-700 flex items-center gap-2"><Users className="w-4 h-4 text-primary-500" /> Team ({project.members?.length})</h3></div>
        <div className="flex flex-wrap gap-2">
          {project.members?.map(m => {
            const u = m.user;
            return (
              <div key={u._id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-50 border border-surface-100 text-sm group">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[10px] font-bold">{getInitials(u.name)}</div>
                <span className="text-surface-700 font-medium">{u.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${m.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-surface-200 text-surface-500'}`}>{m.role}</span>
                {isAdmin && m.role !== 'admin' && <button onClick={() => handleRemoveMember(u._id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        {[{ v: 'all', l: 'All', icon: ListTodo }, { v: 'todo', l: 'To Do', icon: ListTodo }, { v: 'in-progress', l: 'In Progress', icon: Clock }, { v: 'done', l: 'Done', icon: CheckCircle2 }].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.v ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25' : 'bg-white border border-surface-200 text-surface-600 hover:border-primary-200'}`}>
            <f.icon className="w-3.5 h-3.5" />{f.l} {f.v === 'all' ? `(${tasks.length})` : `(${tasks.filter(t => t.status === f.v).length})`}
          </button>
        ))}
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? filteredTasks.map((task, i) => (
          <div key={task._id} className="bg-white rounded-xl border border-surface-100 p-4 hover:shadow-md transition-all animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.03}s` }}>
            <div className="flex items-start gap-3">
              <Flag className={`w-4 h-4 mt-1 flex-shrink-0 ${priorityColors[task.priority]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`font-semibold text-surface-800 ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>{task.title}</h4>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <select value={task.status} onChange={e => handleUpdateTask(task._id, { status: e.target.value })} className="text-xs px-2 py-1 rounded-lg border border-surface-200 bg-surface-50 font-medium focus:outline-none cursor-pointer">
                      {statusOpts.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
                    </select>
                    {isAdmin && <button onClick={() => handleDeleteTask(task._id)} className="p-1 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                  </div>
                </div>
                {task.description && <p className="text-sm text-surface-400 mt-1">{task.description}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                  {task.assignee && <span className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-[8px] font-bold">{getInitials(task.assignee.name)}</div>{task.assignee.name}</span>}
                  {task.dueDate && <span className={`flex items-center gap-1 ${isOverdue(task.dueDate) && task.status !== 'done' ? 'text-red-500 font-medium' : ''}`}><Calendar className="w-3 h-3" />{formatDate(task.dueDate)}</span>}
                  <span className="capitalize">{task.priority} priority</span>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-surface-100">
            <ListTodo className="w-12 h-12 text-surface-200 mx-auto mb-3" />
            <p className="text-surface-400">No tasks {filter !== 'all' ? 'with this status' : 'yet'}</p>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowTaskForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-6"><h2 className="text-xl font-bold text-surface-900">New Task</h2><button onClick={() => setShowTaskForm(false)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"><X className="w-5 h-5" /></button></div>
            {formError && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{formError}</div>}
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div><label className="block text-sm font-semibold text-surface-700 mb-1.5">Title *</label><input value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="Task title" required /></div>
              <div><label className="block text-sm font-semibold text-surface-700 mb-1.5">Description</label><textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20" rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-surface-700 mb-1.5">Assignee</label><select value={taskForm.assignee} onChange={e => setTaskForm({...taskForm, assignee: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"><option value="">Unassigned</option>{project.members?.map(m => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}</select></div>
                <div><label className="block text-sm font-semibold text-surface-700 mb-1.5">Priority</label><select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
              </div>
              <div><label className="block text-sm font-semibold text-surface-700 mb-1.5">Due Date</label><input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowTaskForm(false)} className="flex-1 py-2.5 rounded-xl border border-surface-200 text-surface-600 font-medium text-sm">Cancel</button><button type="submit" disabled={formLoading} className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm flex items-center justify-center disabled:opacity-60">{formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Task'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowMemberForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-6"><h2 className="text-xl font-bold text-surface-900">Add Member</h2><button onClick={() => setShowMemberForm(false)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"><X className="w-5 h-5" /></button></div>
            {formError && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{formError}</div>}
            <form onSubmit={handleAddMember} className="space-y-4">
              <div><label className="block text-sm font-semibold text-surface-700 mb-1.5">Member Email *</label><input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="member@example.com" required /></div>
              <div className="flex gap-3"><button type="button" onClick={() => setShowMemberForm(false)} className="flex-1 py-2.5 rounded-xl border border-surface-200 text-surface-600 font-medium text-sm">Cancel</button><button type="submit" disabled={formLoading} className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm flex items-center justify-center disabled:opacity-60">{formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Member'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
