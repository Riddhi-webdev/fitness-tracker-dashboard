const pad = (n) => String(n).padStart(2, '0');

// Local calendar date as YYYY-MM-DD (not UTC, so logs land on the day the user sees)
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const toLocal = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const shortDate = (s) => toLocal(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
export const longDate = (s) =>
  toLocal(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
export const weekday = (s) => toLocal(s).toLocaleDateString(undefined, { weekday: 'short' });

export const WORKOUT_TYPES = [
  { value: 'running', label: 'Running' },
  { value: 'walking', label: 'Walking' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'strength', label: 'Strength training' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'other', label: 'Other' },
];
export const typeLabel = (v) => WORKOUT_TYPES.find((t) => t.value === v)?.label || v;

export const GOAL_METRICS = [
  { value: 'workouts', label: 'Workouts', unit: 'workouts' },
  { value: 'duration', label: 'Active minutes', unit: 'min' },
  { value: 'distance', label: 'Distance', unit: 'km' },
  { value: 'calories', label: 'Calories burned', unit: 'kcal' },
  { value: 'steps', label: 'Steps', unit: 'steps' },
  { value: 'sleep', label: 'Sleep', unit: 'h' },
];
export const metricInfo = (v) => GOAL_METRICS.find((m) => m.value === v) || { label: v, unit: '' };

export const num = (n) => Number(n || 0).toLocaleString();
export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};
