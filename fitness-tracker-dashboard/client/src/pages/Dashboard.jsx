import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import GoalCard from '../components/GoalCard.jsx';
import { todayStr, shortDate, weekday, typeLabel, num, greeting } from '../utils.js';

const RANGES = [7, 14, 30, 90];
const COLORS = { ember: '#F4622A', pool: '#1457FF', violet: '#6B4EFF' };

function Panel({ title, children, empty }) {
  return (
    <section className="card panel">
      <h2>{title}</h2>
      {empty ? <p className="muted empty">Nothing logged in this period yet.</p> : <div className="chart">{children}</div>}
    </section>
  );
}

const axis = { tick: { fontSize: 12, fill: '#5B6B80' }, tickLine: false, axisLine: false };

export default function Dashboard() {
  const { user } = useAuth();
  const [days, setDays] = useState(14);
  const [stats, setStats] = useState(null);
  const [goals, setGoals] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setError('');
    const today = todayStr();
    Promise.all([api(`/stats?days=${days}&today=${today}`), api(`/goals?today=${today}`)])
      .then(([s, g]) => {
        if (!cancelled) {
          setStats(s);
          setGoals(g);
        }
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p className="muted">Loading…</p>;

  const { totals, series, byType, streak } = stats;
  const week = series.slice(-7);
  const hasWorkouts = series.some((r) => r.workouts > 0);
  const hasSteps = series.some((r) => r.steps != null);
  const hasSleep = series.some((r) => r.sleep != null);
  const firstName = user.name.split(' ')[0];

  return (
    <>
      <header className="hero">
        <div>
          <p className="muted">{greeting()}, {firstName}</p>
          <h1 className="streak">
            {streak}<span>day streak</span>
          </h1>
          <p className="muted">
            {streak > 0 ? 'Keep it going with a workout today.' : 'Log a workout to start a new streak.'}
          </p>
        </div>
        <div className="week" aria-label="Last 7 days">
          {week.map((d) => (
            <div key={d.date} className={`day ${d.workouts ? 'on' : ''} ${d.date === stats.to ? 'today' : ''}`}>
              <span className="bar" style={{ height: `${Math.min(100, 18 + d.duration)}%` }} />
              <span className="lbl">{weekday(d.date).slice(0, 2)}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="toolbar">
        <h2 className="section">Your last {days} days</h2>
        <div className="seg" role="group" aria-label="Range">
          {RANGES.map((r) => (
            <button key={r} className={r === days ? 'on' : ''} onClick={() => setDays(r)}>{r}d</button>
          ))}
        </div>
      </div>

      <div className="stats">
        <div className="stat"><span>Workouts</span><strong>{totals.workouts}</strong></div>
        <div className="stat"><span>Active minutes</span><strong>{num(totals.duration)}</strong></div>
        <div className="stat"><span>Distance</span><strong>{num(totals.distance)}<small> km</small></strong></div>
        <div className="stat"><span>Calories burned</span><strong>{num(totals.calories)}</strong></div>
        <div className="stat"><span>Avg steps / day</span><strong>{totals.avgSteps ? num(totals.avgSteps) : '–'}</strong></div>
        <div className="stat"><span>Avg sleep</span><strong>{totals.avgSleep ? totals.avgSleep : '–'}<small>{totals.avgSleep ? ' h' : ''}</small></strong></div>
      </div>

      {!hasWorkouts && !hasSteps && !hasSleep && (
        <div className="card callout">
          <p>Your charts will fill in as you log. <Link to="/activities">Log your first workout</Link> or <Link to="/daily">add today’s steps and sleep</Link>.</p>
        </div>
      )}

      <div className="charts">
        <Panel title="Calories burned" empty={!hasWorkouts}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <CartesianGrid vertical={false} stroke="#E3E9F0" />
              <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={24} {...axis} />
              <YAxis width={40} {...axis} />
              <Tooltip labelFormatter={shortDate} formatter={(v) => [`${num(v)} kcal`, 'Calories']} />
              <Bar dataKey="calories" fill={COLORS.ember} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Active minutes" empty={!hasWorkouts}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <CartesianGrid vertical={false} stroke="#E3E9F0" />
              <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={24} {...axis} />
              <YAxis width={40} {...axis} />
              <Tooltip labelFormatter={shortDate} formatter={(v) => [`${num(v)} min`, 'Duration']} />
              <Bar dataKey="duration" fill={COLORS.pool} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Steps" empty={!hasSteps}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <CartesianGrid vertical={false} stroke="#E3E9F0" />
              <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={24} {...axis} />
              <YAxis width={48} {...axis} />
              <Tooltip labelFormatter={shortDate} formatter={(v) => [num(v), 'Steps']} />
              <Area type="monotone" dataKey="steps" stroke={COLORS.pool} fill="#1457FF22" strokeWidth={2} connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Sleep (hours)" empty={!hasSleep}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid vertical={false} stroke="#E3E9F0" />
              <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={24} {...axis} />
              <YAxis width={32} domain={[0, 12]} {...axis} />
              <Tooltip labelFormatter={shortDate} formatter={(v) => [`${v} h`, 'Sleep']} />
              <Line type="monotone" dataKey="sleep" stroke={COLORS.violet} strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Time by workout type (min)" empty={!byType.length}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byType.map((t) => ({ ...t, name: typeLabel(t.type) }))} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid horizontal={false} stroke="#E3E9F0" />
              <XAxis type="number" {...axis} />
              <YAxis type="category" dataKey="name" width={110} {...axis} />
              <Tooltip formatter={(v) => [`${num(v)} min`, 'Time']} />
              <Bar dataKey="duration" fill={COLORS.pool} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="toolbar">
        <h2 className="section">Goals</h2>
        <Link to="/goals" className="link">Manage goals</Link>
      </div>
      {goals.length ? (
        <div className="goal-grid">{goals.map((g) => <GoalCard key={g._id} goal={g} />)}</div>
      ) : (
        <p className="muted">No goals yet. <Link to="/goals">Set one</Link> to track your progress here.</p>
      )}
    </>
  );
}
