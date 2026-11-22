import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ActivityForm from '../components/ActivityForm.jsx';
import { WORKOUT_TYPES, typeLabel, longDate, num } from '../utils.js';

export default function Activities() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    api(`/activities?type=${filter}&limit=200`)
      .then((d) => !cancelled && setItems(d))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [filter]);

  function saved(item, wasEdit) {
    if (wasEdit) {
      setItems((list) => list.map((a) => (a._id === item._id ? item : a)));
      setEditing(null);
    } else if (filter === 'all' || filter === item.type) {
      setItems((list) => [item, ...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)));
    }
  }

  async function remove(a) {
    if (!window.confirm(`Delete this ${typeLabel(a.type).toLowerCase()} workout from ${longDate(a.date)}?`)) return;
    try {
      await api(`/activities/${a._id}`, { method: 'DELETE' });
      setItems((list) => list.filter((x) => x._id !== a._id));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h1 className="page-title">Workouts</h1>
      <ActivityForm key={editing?._id || 'new'} initial={editing} onSaved={saved} onCancel={editing ? () => setEditing(null) : null} />

      <div className="toolbar">
        <h2 className="section">History</h2>
        <label className="inline">Show
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All types</option>
            {WORKOUT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {!items ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="muted">No workouts yet. Add your first one above.</p>
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr><th>Date</th><th>Type</th><th>Time</th><th>Distance</th><th>Calories</th><th>Notes</th><th /></tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a._id}>
                  <td>{longDate(a.date)}</td>
                  <td>{typeLabel(a.type)}</td>
                  <td>{a.duration} min</td>
                  <td>{a.distance ? `${a.distance} km` : '–'}</td>
                  <td>{a.calories ? `${num(a.calories)} kcal` : '–'}</td>
                  <td className="notes">{a.notes || '–'}</td>
                  <td className="actions">
                    <button className="link-btn" onClick={() => { setEditing(a); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
                    <button className="link-btn danger" onClick={() => remove(a)}>Delete</button>
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
