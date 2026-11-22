const router = require('express').Router();
const Activity = require('../models/Activity');
const protect = require('../middleware/auth');
const { isDate } = require('../utils/dates');

router.use(protect);

const FIELDS = ['type', 'date', 'duration', 'distance', 'calories', 'notes'];
const pick = (body) => FIELDS.reduce((o, k) => (body[k] !== undefined ? { ...o, [k]: body[k] } : o), {});

// List with optional filters: ?type=running&from=2025-01-01&to=2025-01-31&limit=50
router.get('/', async (req, res, next) => {
  try {
    const { type, from, to } = req.query;
    const filter = { user: req.user._id };
    if (type && type !== 'all') filter.type = type;
    if (isDate(from) || isDate(to)) {
      filter.date = {};
      if (isDate(from)) filter.date.$gte = from;
      if (isDate(to)) filter.date.$lte = to;
    }
    const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500);
    const items = await Activity.find(filter).sort({ date: -1, createdAt: -1 }).limit(limit);
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const item = await Activity.create({ ...pick(req.body), user: req.user._id });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const item = await Activity.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: pick(req.body) },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Activity not found.' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const item = await Activity.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Activity not found.' });
    res.json({ message: 'Activity deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
