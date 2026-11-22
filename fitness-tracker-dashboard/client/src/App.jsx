import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Activities from './pages/Activities.jsx';
import DailyLog from './pages/DailyLog.jsx';
import Goals from './pages/Goals.jsx';

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash">Loading your dashboard…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash">Loading…</div>;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Auth mode="login" /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Auth mode="register" /></GuestOnly>} />
      <Route element={<Protected />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="activities" element={<Activities />} />
          <Route path="daily" element={<DailyLog />} />
          <Route path="goals" element={<Goals />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
