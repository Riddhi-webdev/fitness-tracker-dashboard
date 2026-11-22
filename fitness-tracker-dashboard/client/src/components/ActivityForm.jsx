import { useState } from 'react';
import { api } from '../api.js';
import { WORKOUT_TYPES, todayStr } from '../utils.js';

const blank = () => ({ type: 'running', date: todayStr(), duration: '', distance: '', calories: '', notes: '' });

export default function ActivityForm({ initial, onSaved, onCancel }) {
  const editing = Boolean(initial?._id);
  const [form, setForm] = useState(
    initial
      ? {
          type: initial.type,
          date: initial.date,
          duration: initial.duration,
          distance: initial.distance || '',
          calories: initial.calories || '',
          notes: initial.notes || '',
        }
      : blank()
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const body = {
      type: form.type,
      date: form.date,
      duration: Number(form.duration),
      distance: Number(form.distance || 0),
      calories: Number(form.calories || 0),
      notes: form.notes,
    };
    try {
      const saved = editing
        ? await api(`/activities/${initial._id}`, { method: 'PUT', body })
        : await api('/activities', { method: 'POST', body });
      onSaved(saved, editing);
      if (!editing) setForm(blank());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>{editing ? 'Edit workout' : 'Log a workout'}</h2>
      <div className="grid">
        <label>Type
          <select value={form.type} onChange={set('type')}>
            {WORKOUT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label>Date
          <input type="date" value={form.date} onChange={set('date')} max={todayStr()} required />
        </label>
        <label>Duration (min)
          <input type="number" min="1" max="1440" value={form.duration} onChange={set('duration')} required />
        </label>
        <label>Distance (km)
          <input type="number" min="0" step="0.01" value={form.distance} onChange={set('distance')} />
        </label>
        <label>Calories burned (kcal)
          <input type="number" min="0" value={form.calories} onChange={set('calories')} />
        </label>
      </div>
      <label>Notes
        <textarea rows="2" maxLength="500" value={form.notes} onChange={set('notes')} placeholder="How did it feel?" />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="row">
        <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add workout'}</button>
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
