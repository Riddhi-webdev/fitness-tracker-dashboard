// All dates in this app are plain 'YYYY-MM-DD' strings so time zones never shift a log
// onto the wrong day. String comparison works for ranges because the format sorts lexically.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Rejects impossible dates such as 2026-02-30 by round-tripping through Date
const isDate = (s) => {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10) === s;
};

function parts(s) {
  const [y, m, d] = s.split('-').map(Number);
  return [y, m - 1, d];
}

function addDays(s, n) {
  const [y, m, d] = parts(s);
  return new Date(Date.UTC(y, m, d + n)).toISOString().slice(0, 10);
}

// Weeks start on Monday
function startOfWeek(s) {
  const [y, m, d] = parts(s);
  const dow = new Date(Date.UTC(y, m, d)).getUTCDay();
  return addDays(s, -((dow + 6) % 7));
}

const serverToday = () => new Date().toISOString().slice(0, 10);

// Use the client's local "today" when it is valid, otherwise fall back to the server date
const resolveToday = (q) => (isDate(q) ? q : serverToday());

module.exports = { isDate, addDays, startOfWeek, resolveToday };
