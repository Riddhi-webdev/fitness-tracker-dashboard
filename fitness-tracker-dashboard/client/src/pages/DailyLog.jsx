import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { todayStr, longDate, num } from '../utils.js';

const empty = { steps: '', sleepHours: '', weightKg: '' };

export default function DailyLog() {
  const [logs, setLogs] = useState(null);
  const [date, setDate] = useState(todayStr());
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/metrics?limit=60').then(setLogs).catch((e) => setError(e.message));
  }, []);

  // When the chosen date already has a log, load it into the form for editing
  useEffect(() => {
    if (!logs) return;
    const existing = logs.find((l) => l.date === date);
    setForm(
      existing
        ? { steps: existing.steps ?? '', sleepHours: existing.sleepHours ?? '', weightKg: existing.weightKg ?? '' }
        : empty
    );
  }, [date, logs]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const saved = await api(`/metrics/${date}`, { method: 'PUT', body: form });
      setLogs((list) => [saved, ...list.filter((l) => l._id !== saved._id)].sort((a, b) => (a.date < b.date ? 1 : -1)));
      setNotice(`Saved log for ${longDate(date)}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(l) {
    if (!window.confirm(`Delete the daily log for ${longDate(l.date)}?`)) return;
    try {
      await api(`/metrics/${l._id}`, { method: 'DELETE' });
      setLogs((list) => list.filter((x) => x._id !== l._id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h1 className="page-title">Daily log</h1>
      <form className="card form" onSubmit={submit}>
        <h2>Steps, sleep and weight</h2>
        <p className="muted">Pick a day to add or update its numbers. Leave a field empty to keep it unchanged.</p>
        <div className="grid">
          <label>Date
            <input type="date" value={date} max={todayStr()} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label>Steps
            <input type="number" min="0" max="200000" value={form.steps} onChange={set('steps')} />
          </label>
          <label>Sleep (hours)
            <input type="number" min="0" max="24" step="0.1" value={form.sleepHours} onChange={set('sleepHours')} />
          </label>
          <label>Weight (kg)
            <input type="number" min="1" max="500" step="0.1" value={form.weightKg} onChange={set('weightKg')} />
          </label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        {notice && <p className="ok" role="status">{notice}</p>}
        <div className="row"><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save daily log'}</button></div>
      </form>

      <h2 className="section spaced">Recent logs</h2>
      {!logs ? (
        <p className="muted">Loading…</p>
      ) : logs.length === 0 ? (
        <p className="muted">No daily logs yet.</p>
      ) : (
        <div className="table-wrap card">
          <table>
            <thead><tr><th>Date</th><th>Steps</th><th>Sleep</th><th>Weight</th><th /></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id}>
                  <td>{longDate(l.date)}</td>
                  <td>{l.steps != null ? num(l.steps) : '–'}</td>
                  <td>{l.sleepHours != null ? `${l.sleepHours} h` : '–'}</td>
                  <td>{l.weightKg != null ? `${l.weightKg} kg` : '–'}</td>
                  <td className="actions">
                    <button className="link-btn" onClick={() => { setDate(l.date); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
                    <button className="link-btn danger" onClick={() => remove(l)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
