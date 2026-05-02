import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Loader2, Zap, ArrowRight } from 'lucide-react';

const Signup = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex animated-gradient" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Decorative blobs */}
      <div className="animate-float" style={{ position: 'absolute', top: '10rem', right: '5rem', width: '20rem', height: '20rem', background: 'rgba(99,102,241,0.2)', borderRadius: '9999px', filter: 'blur(48px)' }} />
      <div className="animate-float" style={{ position: 'absolute', bottom: '2.5rem', left: '2.5rem', width: '16rem', height: '16rem', background: 'rgba(129,140,248,0.15)', borderRadius: '9999px', filter: 'blur(48px)', animationDelay: '2s' }} />

      {/* Left side - Branding */}
      <div style={{ flex: 1, display: 'none', alignItems: 'center', justifyContent: 'center', padding: '3rem', position: 'relative' }} className="lg:!flex">
        <div className="animate-fade-in-up" style={{ maxWidth: '28rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Zap style={{ width: '1.75rem', height: '1.75rem', color: 'white' }} />
            </div>
            <span style={{ fontSize: '1.875rem', fontWeight: 700, color: 'white' }}>TaskFlow</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '1rem' }}>
            Start building<br />
            <span style={{ color: '#a5b4fc' }}>amazing projects</span> today.
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
            Join thousands of teams who use TaskFlow to stay organized, hit deadlines, and deliver outstanding work together.
          </p>
          <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Projects', value: 'Unlimited' },
              { label: 'Team Members', value: 'No limits' },
              { label: 'Task Tracking', value: 'Real-time' },
              { label: 'Access Control', value: 'Role-based' },
            ].map((stat) => (
              <div key={stat.label} style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>{stat.value}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '0.125rem' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div className="auth-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="glass" style={{ borderRadius: '1.5rem', padding: '2.5rem' }}>
            {/* Mobile logo */}
            <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div className="gradient-primary" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>TaskFlow</span>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Create your account</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9375rem' }}>Get started for free — no credit card required</p>

            {error && (
              <div className="animate-fade-in-up" style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.875rem', fontWeight: 500 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="signup-name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User className="input-icon" />
                  <input id="signup-name" type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" required />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="signup-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail className="input-icon" />
                  <input id="signup-email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="signup-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock className="input-icon" />
                  <input id="signup-password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min. 6 characters" required minLength={6} />
                </div>
              </div>

              <button
                type="submit"
                id="signup-submit"
                disabled={loading}
                className="gradient-primary"
                style={{
                  width: '100%', padding: '0.875rem', borderRadius: '0.75rem', color: 'white',
                  fontWeight: 600, fontSize: '0.9375rem', border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.2s', opacity: loading ? 0.6 : 1,
                  marginTop: '0.5rem',
                }}
                onMouseEnter={e => { if(!loading) e.target.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              >
                {loading ? (
                  <Loader2 style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>Create Account <ArrowRight style={{ width: '1rem', height: '1rem' }} /></>
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', marginTop: '2rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
