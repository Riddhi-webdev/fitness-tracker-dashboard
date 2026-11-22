const router = require('express').Router();
const Goal = require('../models/Goal');
const Activity = require('../models/Activity');
const Metric = require('../models/Metric');
const protect = require('../middleware/auth');
const { addDays, startOfWeek, resolveToday } = require('../utils/dates');

router.use(protect);

const FIELDS = ['metric', 'period', 'target'];
const pick = (body) => FIELDS.reduce((o, k) => (body[k] !== undefined ? { ...o, [k]: body[k] } : o), {});

async function withProgress(userId, goal, today) {
  const from = goal.period === 'weekly' ? startOfWeek(today) : today;
  const to = goal.period === 'weekly' ? addDays(from, 6) : today;
  const range = { $gte: from, $lte: to };
  let current = 0;

  if (['workouts', 'duration', 'distance', 'calories'].includes(goal.metric)) {
    const acts = await Activity.find({ user: userId, date: range });
    current = goal.metric === 'workouts' ? acts.length : acts.reduce((s, a) => s + (a[goal.metric] || 0), 0);
  } else {
    const field = goal.metric === 'steps' ? 'steps' : 'sleepHours';
    const rows = await Metric.find({ user: userId, date: range });
    current = rows.reduce((s, r) => s + (r[field] || 0), 0);
  }

  current = Math.round(current * 10) / 10;
  const percent = Math.min(100, Math.round((current / goal.target) * 100));
  return { ...goal.toObject(), current, percent, completed: current >= goal.target, from, to };
}

router.get('/', async (req, res, next) => {
  try {
    const today = resolveToday(req.query.today);
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(await Promise.all(goals.map((g) => withProgress(req.user._id, g, today))));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const goal = await Goal.create({ ...pick(req.body), user: req.user._id });
    res.status(201).json(await withProgress(req.user._id, goal, resolveToday(req.query.today)));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: pick(req.body) },
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });
    res.json(await withProgress(req.user._id, goal, resolveToday(req.query.today)));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });
    res.json({ message: 'Goal deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
