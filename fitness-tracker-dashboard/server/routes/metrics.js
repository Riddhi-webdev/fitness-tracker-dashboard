const router = require('express').Router();
const Metric = require('../models/Metric');
const protect = require('../middleware/auth');
const { isDate } = require('../utils/dates');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const filter = { user: req.user._id };
    if (isDate(from) || isDate(to)) {
      filter.date = {};
      if (isDate(from)) filter.date.$gte = from;
      if (isDate(to)) filter.date.$lte = to;
    }
    const limit = Math.min(parseInt(req.query.limit, 10) || 60, 400);
    res.json(await Metric.find(filter).sort({ date: -1 }).limit(limit));
  } catch (err) {
    next(err);
  }
});

// Create or update the log for one day
router.put('/:date', async (req, res, next) => {
  try {
    if (!isDate(req.params.date)) return res.status(400).json({ message: 'Date must be YYYY-MM-DD.' });

    const set = {};
    ['steps', 'sleepHours', 'weightKg'].forEach((k) => {
      const v = req.body[k];
      if (v !== undefined && v !== null && v !== '') set[k] = Number(v);
    });
    if (!Object.keys(set).length) {
      return res.status(400).json({ message: 'Enter steps, sleep or weight to save.' });
    }

    const doc = await Metric.findOneAndUpdate(
      { user: req.user._id, date: req.params.date },
      { $set: set },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await Metric.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Daily log not found.' });
    res.json({ message: 'Daily log deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
