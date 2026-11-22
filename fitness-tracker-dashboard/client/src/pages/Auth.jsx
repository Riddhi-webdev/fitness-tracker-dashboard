import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-art" aria-hidden="true">
        <h1>Pacelog</h1>
        <p>Every run, lift and good night of sleep in one place.</p>
      </div>
      <form className="auth-card" onSubmit={submit}>
        <h2>{isLogin ? 'Log in' : 'Create your account'}</h2>
        {!isLogin && (
          <label>Name
            <input value={form.name} onChange={set('name')} required autoComplete="name" />
          </label>
        )}
        <label>Email
          <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
        </label>
        <label>Password
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            minLength={6}
            required
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn primary wide" disabled={busy}>
          {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
        </button>
        <p className="muted center">
          {isLogin ? (
            <>New here? <Link to="/register">Create an account</Link></>
          ) : (
            <>Already have an account? <Link to="/login">Log in</Link></>
          )}
        </p>
      </form>
    </div>
  );
}
