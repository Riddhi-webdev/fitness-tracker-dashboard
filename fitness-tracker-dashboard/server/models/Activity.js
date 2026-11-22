const mongoose = require('mongoose');

const TYPES = ['running', 'walking', 'cycling', 'swimming', 'strength', 'yoga', 'hiit', 'other'];

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: { values: TYPES, message: 'Choose a valid workout type.' }, required: true },
    date: { type: String, required: [true, 'Date is required.'], match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD.'] },
    duration: { type: Number, required: [true, 'Duration is required.'], min: [1, 'Duration must be at least 1 minute.'], max: 1440 },
    distance: { type: Number, default: 0, min: [0, 'Distance cannot be negative.'], max: 1000 },
    calories: { type: Number, default: 0, min: [0, 'Calories cannot be negative.'], max: 20000 },
    notes: { type: String, trim: true, maxlength: [500, 'Notes can be up to 500 characters.'], default: '' },
  },
  { timestamps: true }
);

activitySchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Activity', activitySchema);
module.exports.TYPES = TYPES;
