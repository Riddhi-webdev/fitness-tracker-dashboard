const mongoose = require('mongoose');

// One document per user per day: steps, sleep and body weight
const metricSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true, match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD.'] },
    steps: { type: Number, min: [0, 'Steps cannot be negative.'], max: 200000 },
    sleepHours: { type: Number, min: [0, 'Sleep cannot be negative.'], max: [24, 'Sleep cannot exceed 24 hours.'] },
    weightKg: { type: Number, min: [1, 'Enter a valid weight.'], max: 500 },
  },
  { timestamps: true }
);

metricSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Metric', metricSchema);
