import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Plus, FolderKanban, Users, Search, X, Loader2, ArrowRight, ListTodo } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try { const res = await api.get('/projects'); setProjects(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setFormError(''); setFormLoading(true);
    try {
      const res = await api.post('/projects', form);
      setProjects([res.data, ...projects]); setShowForm(false); setForm({ name: '', description: '' });
    } catch (err) { setFormError(err.response?.data?.message || 'Failed'); }
    finally { setFormLoading(false); }
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const getProgress = (c) => (!c || c.total === 0) ? 0 : Math.round((c.done / c.total) * 100);

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">Projects</h1>
          <p className="text-surface-500 mt-1">Manage your team's projects.</p>
        </div>
        <button onClick={() => setShowForm(true)} id="create-project-btn" className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-primary-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {projects.length > 0 && (
        <div className="relative max-w-md"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="Search projects..." /></div>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project, i) => {
            const progress = getProgress(project.taskCounts);
            return (
              <Link key={project._id} to={`/projects/${project._id}`} className="group bg-white rounded-2xl border border-surface-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md"><FolderKanban className="w-5 h-5 text-white" /></div>
                  <ArrowRight className="w-4 h-4 text-surface-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-bold text-surface-900 text-lg mb-1 truncate group-hover:text-primary-600 transition-colors">{project.name}</h3>
                <p className="text-sm text-surface-400 line-clamp-2 mb-4 min-h-[2.5rem]">{project.description || 'No description'}</p>
                <div className="mb-4"><div className="flex justify-between text-xs mb-1.5"><span className="text-surface-500">Progress</span><span className="text-surface-700 font-bold">{progress}%</span></div>
                <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} /></div></div>
                <div className="flex items-center justify-between text-xs text-surface-500">
                  <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{project.members?.length || 0} members</div>
                  <div className="flex items-center gap-1.5"><ListTodo className="w-3.5 h-3.5" />{project.taskCounts?.total || 0} tasks</div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20"><FolderKanban className="w-16 h-16 text-surface-200 mx-auto mb-4" /><h3 className="text-lg font-semibold text-surface-700 mb-2">{search ? 'No matching projects' : 'No projects yet'}</h3>
        {!search && <button onClick={() => setShowForm(true)} className="px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm">Create Project</button>}</div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-surface-900">Create Project</h2><button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"><X className="w-5 h-5" /></button></div>
            {formError && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{formError}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label htmlFor="project-name" className="block text-sm font-semibold text-surface-700 mb-1.5">Project Name *</label><input id="project-name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="e.g. Marketing Campaign" required /></div>
              <div><label htmlFor="project-desc" className="block text-sm font-semibold text-surface-700 mb-1.5">Description</label><textarea id="project-desc" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20" rows={3} placeholder="What's this project about?" /></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-surface-200 text-surface-600 font-medium text-sm">Cancel</button>
              <button type="submit" disabled={formLoading} className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">{formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
