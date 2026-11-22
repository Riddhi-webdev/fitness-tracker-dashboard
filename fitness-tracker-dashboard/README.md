# Fitness Tracker Dashboard (Pacelog)


solo:  Riddhi Gupta
Guide: Mr. Abhishek Singh

A full-stack MERN web app to log workouts, track daily steps / sleep / weight, set goals and see progress on a chart dashboard.

**Stack:** React 18 (Vite) + Recharts, Node.js + Express, MongoDB + Mongoose, JWT authentication (bcrypt-hashed passwords).

## Features (mapped to the synopsis modules)

| Synopsis module | What is implemented |
|---|---|
| User Authentication | Register, login, protected routes, JWT sessions (7 days), session restore on refresh |
| Activity Logging (CRUD) | Add / edit / delete workouts: type, date, duration, distance, calories, notes; filter by type |
| Dashboard & Visualization | Streak + 7-day strip, totals, calories / minutes / steps / sleep charts, time by workout type, 7/14/30/90-day ranges |
| Goal Tracking | Daily or weekly goals for workouts, minutes, distance, calories, steps, sleep with live progress bars |
| Database Management | Mongoose models (User, Activity, Metric, Goal), per-user data isolation, indexes, validation |
| Daily metrics | Steps, sleep hours and weight per day (one record per day, editable) |

## Prerequisites

- Node.js 18 or newer
- MongoDB running locally (`mongodb://127.0.0.1:27017`) **or** a free MongoDB Atlas cluster

## Quick start

```bash
# 1. install everything (root + server + client)
npm run install-all

# 2. configure the server
#    server/.env is already created from .env.example - edit MONGO_URI and set a long random JWT_SECRET

# 3. (optional) load demo data: login demo@fitness.com / demo123
npm run seed --prefix server

# 4. run API (http://localhost:5000) and client (http://localhost:5173) together
npm run dev
```

Open http://localhost:5173, create an account (or use the demo login) and start logging.

To run the two parts separately: `npm run dev --prefix server` and `npm run dev --prefix client`.

### Using MongoDB Atlas
Put your connection string in `server/.env`:
```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/fitness_tracker
```

## Production build / deployment

```bash
npm run build                      # builds client/dist
NODE_ENV=production npm start      # Express serves the API and the built React app on one port
```
Deploy the whole folder to a host such as Render or Railway, set `MONGO_URI`, `JWT_SECRET` and `NODE_ENV=production` as environment variables, build command `npm run install-all && npm run build`, start command `npm start`.
If you host the client separately (Vercel / Netlify), set `VITE_API_URL=https://your-api-host/api` at build time and `CLIENT_URL` on the server.

## Project structure

```
fitness-tracker-dashboard/
├── package.json              root scripts (dev, build, start, install-all)
├── server/
│   ├── server.js             Express app entry
│   ├── seed.js               demo data
│   ├── config/db.js          MongoDB connection
│   ├── middleware/           auth (JWT), error handling
│   ├── models/               User, Activity, Metric, Goal
│   ├── routes/               auth, activities, metrics, goals, stats
│   └── utils/                date helpers, token helper
└── client/
    ├── index.html, vite.config.js
    └── src/
        ├── App.jsx, main.jsx, api.js, utils.js, index.css
        ├── context/AuthContext.jsx
        ├── components/       Layout, ActivityForm, GoalCard
        └── pages/            Auth, Dashboard, Activities, DailyLog, Goals
```

## REST API

All routes except `/api/auth/register` and `/api/auth/login` need `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/activities` | List (filters: `type`, `from`, `to`, `limit`) / create workout |
| PUT/DELETE | `/api/activities/:id` | Update / delete workout |
| GET | `/api/metrics` | List daily logs |
| PUT | `/api/metrics/:date` | Create or update a day's steps / sleep / weight |
| DELETE | `/api/metrics/:id` | Delete a daily log |
| GET/POST | `/api/goals` | List with progress / create goal |
| PUT/DELETE | `/api/goals/:id` | Update / delete goal |
| GET | `/api/stats?days=14` | Dashboard totals, daily series, type breakdown, streak |

## Notes for the report / viva

- **Authentication:** the synopsis mentions Clerk in the Availability section. This build uses email + password with JWT and bcrypt instead, so it runs with no third-party account. You can describe it as the project's own authentication service (the DFD "Auth Service" entity) or swap in Clerk later.
- **Dates** are stored as `YYYY-MM-DD` strings so a workout always stays on the day the user logged it, regardless of time zone.
- **Security:** passwords are hashed with bcrypt, every query is filtered by the logged-in user's id, request bodies are whitelisted before saving, and Mongoose validates all fields.
