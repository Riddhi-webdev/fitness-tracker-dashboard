import { metricInfo, num, shortDate } from '../utils.js';

export default function GoalCard({ goal, onDelete }) {
  const info = metricInfo(goal.metric);
  const range = goal.period === 'weekly' ? `${shortDate(goal.from)} – ${shortDate(goal.to)}` : 'Today';
  return (
    <article className={`goal ${goal.completed ? 'done' : ''}`}>
      <div className="goal-head">
        <div>
          <h3>{info.label} {goal.period === 'weekly' ? 'per week' : 'per day'}</h3>
          <p className="muted">{range}</p>
        </div>
        {onDelete && <button className="link-btn danger" onClick={() => onDelete(goal)}>Delete</button>}
      </div>
      <div className="progress" role="progressbar" aria-valuenow={goal.percent} aria-valuemin="0" aria-valuemax="100">
        <div style={{ width: `${goal.percent}%` }} />
      </div>
      <p className="goal-foot">
        <strong>{num(goal.current)}</strong> of {num(goal.target)} {info.unit}
        <span className="pct">{goal.completed ? 'Goal met' : `${goal.percent}%`}</span>
      </p>
    </article>
  );
}
