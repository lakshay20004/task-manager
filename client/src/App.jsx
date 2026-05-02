import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import MyTasks from './pages/MyTasks';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/" replace /> : <Signup />}
      />

      {/* Protected routes with sidebar layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Sidebar>
              <Dashboard />
            </Sidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Sidebar>
              <Projects />
            </Sidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <Sidebar>
              <ProjectDetail />
            </Sidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-tasks"
        element={
          <ProtectedRoute>
            <Sidebar>
              <MyTasks />
            </Sidebar>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-surface-50">
            <div className="text-center animate-fade-in-up">
              <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
              <p className="text-surface-500 text-lg mb-6">Page not found</p>
              <a
                href="/"
                className="px-6 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
              >
                Go Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
