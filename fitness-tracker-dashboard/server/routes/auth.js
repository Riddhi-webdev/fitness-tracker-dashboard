const router = require('express').Router();
const User = require('../models/User');
const protect = require('../middleware/auth');
const { signToken } = require('../utils/token');

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const exists = await User.findOne({ email: String(email || '').toLowerCase() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });

    const user = await User.create({ name, email, password });
    res.status(201).json({ token: signToken(user._id), user: user.toSafe() });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Enter your email and password.' });

    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    res.json({ token: signToken(user._id), user: user.toSafe() });
  } catch (err) {
    next(err);
  }
});

router.get('/me', protect, (req, res) => res.json({ user: req.user.toSafe() }));

module.exports = router;
