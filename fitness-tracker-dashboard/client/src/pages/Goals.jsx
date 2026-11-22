import { useEffect, useState } from 'react';
import { api } from '../api.js';
import GoalCard from '../components/GoalCard.jsx';
import { GOAL_METRICS, metricInfo, todayStr } from '../utils.js';

export default function Goals() {
  const [goals, setGoals] = useState(null);
  const [form, setForm] = useState({ metric: 'steps', period: 'daily', target: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/goals?today=${todayStr()}`).then(setGoals).catch((e) => setError(e.message));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const goal = await api(`/goals?today=${todayStr()}`, {
        method: 'POST',
        body: { ...form, target: Number(form.target) },
      });
      setGoals((list) => [goal, ...list]);
      setForm((f) => ({ ...f, target: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(goal) {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await api(`/goals/${goal._id}`, { method: 'DELETE' });
      setGoals((list) => list.filter((g) => g._id !== goal._id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h1 className="page-title">Goals</h1>
      <form className="card form" onSubmit={submit}>
        <h2>Set a goal</h2>
        <div className="grid">
          <label>Track
            <select value={form.metric} onChange={set('metric')}>
              {GOAL_METRICS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </label>
          <label>Period
            <select value={form.period} onChange={set('period')}>
              <option value="daily">Every day</option>
              <option value="weekly">Every week (Mon–Sun)</option>
            </select>
          </label>
          <label>Target ({metricInfo(form.metric).unit})
            <input type="number" min="0.1" step="any" value={form.target} onChange={set('target')} required />
          </label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="row"><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Add goal'}</button></div>
      </form>

      <h2 className="section spaced">Your goals</h2>
      {!goals ? (
        <p className="muted">Loading…</p>
      ) : goals.length === 0 ? (
        <p className="muted">No goals yet. Try 10,000 steps a day or 4 workouts a week.</p>
      ) : (
        <div className="goal-grid">{goals.map((g) => <GoalCard key={g._id} goal={g} onDelete={remove} />)}</div>
      )}
    </>
  );
}
