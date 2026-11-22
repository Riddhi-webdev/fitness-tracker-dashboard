// Creates a demo account with ~5 weeks of sample data so the dashboard has something to show.
// Usage: npm run seed --prefix server      (login: demo@fitness.com / demo123)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Activity = require('./models/Activity');
const Metric = require('./models/Metric');
const Goal = require('./models/Goal');
const { addDays } = require('./utils/dates');

const today = new Date().toISOString().slice(0, 10);
const rand = (a, b) => Math.round(a + Math.random() * (b - a));
const PROFILES = {
  running: () => { const km = rand(3, 10); return { duration: km * rand(5, 7), distance: km, calories: km * 62 }; },
  cycling: () => { const km = rand(10, 30); return { duration: Math.round(km * 2.8), distance: km, calories: km * 32 }; },
  walking: () => { const km = rand(2, 6); return { duration: km * 12, distance: km, calories: km * 45 }; },
  strength: () => ({ duration: rand(35, 70), distance: 0, calories: rand(180, 380) }),
  yoga: () => ({ duration: rand(30, 60), distance: 0, calories: rand(100, 220) }),
  swimming: () => ({ duration: rand(30, 50), distance: Number((rand(8, 20) / 10).toFixed(1)), calories: rand(250, 450) }),
};

(async () => {
  await connectDB();
  await User.deleteOne({ email: 'demo@fitness.com' });
  const user = await User.create({ name: 'Demo User', email: 'demo@fitness.com', password: 'demo123' });

  const acts = [];
  const metrics = [];
  const kinds = Object.keys(PROFILES);
  for (let i = 34; i >= 0; i -= 1) {
    const date = addDays(today, -i);
    if (Math.random() < 0.62) {
      const type = kinds[rand(0, kinds.length - 1)];
      acts.push({ user: user._id, type, date, notes: '', ...PROFILES[type]() });
    }
    metrics.push({
      user: user._id,
      date,
      steps: rand(4500, 13500),
      sleepHours: Number((rand(55, 90) / 10).toFixed(1)),
      weightKg: Number((72 - i * 0.03 + Math.random() * 0.6).toFixed(1)),
    });
  }
  await Activity.insertMany(acts);
  await Metric.insertMany(metrics);
  await Goal.insertMany([
    { user: user._id, metric: 'steps', period: 'daily', target: 10000 },
    { user: user._id, metric: 'workouts', period: 'weekly', target: 4 },
    { user: user._id, metric: 'calories', period: 'weekly', target: 2000 },
    { user: user._id, metric: 'sleep', period: 'daily', target: 8 },
  ]);

  console.log(`Seeded ${acts.length} workouts and ${metrics.length} daily logs. Login: demo@fitness.com / demo123`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
