# Local Meetup RSVP Tracker

A full-stack app for creating local meetups, browsing what other people have
created, and RSVPing (going / maybe / declined).

## How to run

```bash
docker compose up
```

That's it — one command boots MySQL, runs the schema migration, seeds three
demo users and two sample events, starts the API, and starts the frontend.
No manual setup steps.

- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:4000**
- MySQL: **localhost:3306** (exposed for convenience/inspection, not required)

## Test login credentials

There is no registration — accounts are seeded directly into MySQL.

| Name     | Email                  | Password       |
|----------|-------------------------|----------------|
| Sanooja  | sanooja@example.com     | `Password123!` |
| Alex     | alex@example.com        | `Password123!` |
| John     | john@example.com        | `Password123!` |

The login page also has one-click buttons that fill these in for you.

The database is seeded with **9 sample meetups** (mix of past and upcoming,
spread across all three users) plus RSVP data, so the app has real content
to browse immediately.

## Tech stack

- **Frontend:** Next.js 14 (App Router), React, JavaScript/JSX, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MySQL 8
- **Auth:** JWT + bcrypt password hashing
- **Infra:** Docker, Docker Compose

## Architecture

```
docker-compose.yml
├── mysql     — MySQL 8, auto-initialized from backend/src/db/migrations/*.sql
├── backend   — Express REST API (port 4000)
└── frontend  — Next.js App Router app (port 3000), talks to the backend
                over NEXT_PUBLIC_API_URL from the browser
```

```
backend/
  src/
    config/db.js               MySQL connection pool + startup retry loop
    controllers/                request handling + validation
    middleware/
      auth.middleware.js       requireAuth / optionalAuth (JWT verification)
      error.middleware.js      centralized error responses
    routes/                     Express routers
    services/                   DB access + business logic
    db/migrations/001_init.sql schema + seed data (auto-run by MySQL)
    app.js / server.js

frontend/
  src/
    app/
      login/page.jsx
      events/page.jsx
      events/create/page.jsx
      events/[id]/page.jsx
      events/[id]/edit/page.jsx
      layout.jsx
    components/                Navbar, EventCard, EventForm, RSVPButtons
    context/AuthContext.jsx    client-side auth state (token in localStorage)
    lib/api.js                 fetch wrapper for the backend API
```

## Database structure

Three tables, normalized, with foreign keys and constraints enforced at the
database level (not just in application code):

**users** — `id, name, email (unique), password_hash, created_at, updated_at`

**events** — `id, title, description, location, start_time, end_time,
created_by (FK → users.id), created_at, updated_at`
- `CHECK (end_time > start_time)`
- `ON DELETE CASCADE` from users — if a user were removed, their events go
  with them (no orphaned events)

**rsvps** — `id, event_id (FK → events.id), user_id (FK → users.id), status
ENUM('going','maybe','declined'), created_at, updated_at`
- `UNIQUE (event_id, user_id)` — a user can only have one RSVP per event.
  Changing your RSVP does an `INSERT ... ON DUPLICATE KEY UPDATE` (upsert),
  never a second row.
- `ON DELETE CASCADE` from both events and users — deleting an event or user
  cleans up their RSVPs automatically, so there's no way to end up with an
  RSVP pointing at a row that no longer exists.

Relationships: `users 1—N events`, `users 1—N rsvps`, `events 1—N rsvps`.

## API endpoints

| Method | Path                     | Auth        | Notes                                  |
|--------|--------------------------|-------------|-----------------------------------------|
| POST   | `/api/auth/login`        | —           | Returns `{ token, user }`               |
| GET    | `/api/auth/me`           | required    | Returns the decoded token's user        |
| GET    | `/api/events`            | optional    | List all events + RSVP counts           |
| GET    | `/api/events/:id`        | optional    | Event details + attendees + your RSVP   |
| POST   | `/api/events`            | required    | Create an event                         |
| PUT    | `/api/events/:id`        | owner only  | 403 if you're not the creator           |
| DELETE | `/api/events/:id`        | owner only  | 403 if you're not the creator           |
| GET    | `/api/events/:id/rsvps`  | —           | Attendees grouped by status             |
| POST   | `/api/events/:id/rsvp`   | required    | Upsert your RSVP (`going/maybe/declined`) |

"Optional" auth means the route works while logged out (public browsing),
but personalizes the response (e.g. `my_rsvp`) when a valid token is sent.

Status codes used: `200, 201, 400, 401, 403, 404, 500` — with JSON error
bodies like `{ "message": "Event not found." }` and no stack traces exposed
to the client.

## Authentication approach

- Passwords are hashed with **bcrypt** (10 salt rounds) — plaintext
  passwords are never stored, and `password_hash` is never returned by the
  API.
- `POST /api/auth/login` verifies the password with `bcrypt.compare` and
  signs a **JWT** (`sub`, `email`, `name`, 8h expiry) using `JWT_SECRET`
  from the environment — never hard-coded.
- `requireAuth` middleware reads the `Authorization: Bearer <token>` header,
  verifies the JWT, and attaches `{ id, email, name }` to `req.user`.
  Missing or invalid tokens get a `401` before the request reaches any
  route handler.
- `optionalAuth` is the same idea but doesn't reject the request on a
  missing/invalid token — used on public GET routes that still want to
  know who's asking, if anyone.

## Ownership authorization

Only the user who created an event may edit or delete it. This is enforced
**on the server**, not just by hiding buttons in the UI:

- `PUT /api/events/:id` and `DELETE /api/events/:id` both load the event
  first, compare `event.created_by` to `req.user.id`, and return `403
  Forbidden` if they don't match — before any write happens.
- The frontend also hides the Edit/Delete buttons for non-owners as a UX
  nicety, but that's convenience only. Hitting the API directly as a
  different user still gets a 403 (verified in manual testing).

## Security checklist

- bcrypt password hashing (no plaintext, ever)
- JWT verification on every protected route
- Ownership checks enforced server-side for edit/delete
- Parameterized SQL everywhere (`mysql2` placeholders — no string
  concatenation of user input into queries)
- Server-side validation on event creation/editing (required fields,
  `end_time > start_time`)
- Centralized error handler — no stack traces or internals leaked to
  the client
- Secrets (JWT secret, DB credentials) come from environment variables,
  never hard-coded

## Environment variables

**Backend** (`backend/.env.example`)

```
PORT=4000
DB_HOST=mysql
DB_PORT=3306
DB_NAME=meetup_rsvp
DB_USER=app_user
DB_PASSWORD=app_password
JWT_SECRET=change_this_dev_secret
JWT_EXPIRES_IN=8h
```

**Frontend** (`frontend/.env.example`)

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

`docker-compose.yml` already sets sensible defaults for all of these, so
`docker compose up` works with no `.env` file needed. The `.env.example`
files are there for anyone running a service outside Docker (e.g. `npm run
dev` against a local MySQL).



