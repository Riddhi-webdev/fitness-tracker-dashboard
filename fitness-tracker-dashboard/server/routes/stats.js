const router = require('express').Router();
const Activity = require('../models/Activity');
const Metric = require('../models/Metric');
const protect = require('../middleware/auth');
const { addDays, resolveToday } = require('../utils/dates');

router.use(protect);

const round = (n, p = 1) => Math.round(n * 10 ** p) / 10 ** p;

// GET /api/stats?days=14&today=YYYY-MM-DD
router.get('/', async (req, res, next) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 14, 1), 365);
    const today = resolveToday(req.query.today);
    const from = addDays(today, -(days - 1));

    const [acts, metrics] = await Promise.all([
      Activity.find({ user: req.user._id, date: { $gte: from, $lte: today } }),
      Metric.find({ user: req.user._id, date: { $gte: from, $lte: today } }),
    ]);

    // One row per day so charts have no gaps
    const series = [];
    const byDate = {};
    for (let i = 0; i < days; i += 1) {
      const date = addDays(from, i);
      byDate[date] = { date, workouts: 0, duration: 0, distance: 0, calories: 0, steps: null, sleep: null, weight: null };
      series.push(byDate[date]);
    }
    acts.forEach((a) => {
      const row = byDate[a.date];
      row.workouts += 1;
      row.duration += a.duration;
      row.distance += a.distance || 0;
      row.calories += a.calories || 0;
    });
    metrics.forEach((m) => {
      const row = byDate[m.date];
      if (m.steps != null) row.steps = m.steps;
      if (m.sleepHours != null) row.sleep = m.sleepHours;
      if (m.weightKg != null) row.weight = m.weightKg;
    });
    series.forEach((r) => {
      r.distance = round(r.distance);
    });

    const stepRows = series.filter((r) => r.steps != null);
    const sleepRows = series.filter((r) => r.sleep != null);
    const avg = (rows, key) => (rows.length ? round(rows.reduce((s, r) => s + r[key], 0) / rows.length) : 0);
    const totals = {
      workouts: acts.length,
      duration: acts.reduce((s, a) => s + a.duration, 0),
      distance: round(acts.reduce((s, a) => s + (a.distance || 0), 0)),
      calories: acts.reduce((s, a) => s + (a.calories || 0), 0),
      avgSteps: Math.round(avg(stepRows, 'steps')),
      avgSleep: avg(sleepRows, 'sleep'),
    };

    const typeMap = {};
    acts.forEach((a) => {
      typeMap[a.type] = typeMap[a.type] || { type: a.type, workouts: 0, duration: 0 };
      typeMap[a.type].workouts += 1;
      typeMap[a.type].duration += a.duration;
    });
    const byType = Object.values(typeMap).sort((a, b) => b.workouts - a.workouts);

    // Streak: consecutive days with a workout, counted back from today.
    // An empty today does not break the streak yet.
    const streakFrom = addDays(today, -364);
    const dates = new Set(
      (await Activity.find({ user: req.user._id, date: { $gte: streakFrom, $lte: today } }).select('date')).map((a) => a.date)
    );
    let cursor = dates.has(today) ? today : addDays(today, -1);
    let streak = 0;
    while (dates.has(cursor)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }

    res.json({ days, from, to: today, totals, series, byType, streak });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
