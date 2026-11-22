const mongoose = require('mongoose');

const METRICS = ['workouts', 'duration', 'distance', 'calories', 'steps', 'sleep'];

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    metric: { type: String, enum: { values: METRICS, message: 'Choose a valid goal metric.' }, required: true },
    period: { type: String, enum: { values: ['daily', 'weekly'], message: 'Period must be daily or weekly.' }, required: true },
    target: { type: Number, required: [true, 'Target is required.'], min: [0.1, 'Target must be greater than 0.'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
module.exports.METRICS = METRICS;
