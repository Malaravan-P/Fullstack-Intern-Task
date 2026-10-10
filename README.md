# Mini SaaS Template Store

A full-stack web application where users browse a catalogue of HTML templates, preview them live, save favorites, and manage private collections. Built for the **Gnxtace Technologies Full Stack Intern Assessment**.

The app started from the four core requirements in the brief (auth, browse, favorites, My Favorites) and was extended with a submission/review workflow, ratings, collections, in-app notifications and a live customization playground.

> **How to read this README**
> - **Required Features** — exactly what the assessment brief asked for, mapped item-by-item.
> - **Added Extra** — a separate section listing everything built *beyond* the requirements (both the optional bonus items named in the brief and features that were never requested).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Required Features (from the assessment brief)](#required-features-from-the-assessment-brief)
- [Added Extra (beyond the requirements)](#added-extra-beyond-the-requirements)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [npm Scripts](#npm-scripts)
- [Submission Checklist](#submission-checklist)
- [Contact](#contact)

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 + Vite | Brief required React via Vite **or** CRA — Vite chosen |
| Routing | React Router v6 | Client-side routing + protected routes |
| Styling | Tailwind CSS 3 | Brief lists Tailwind as *preferred* |
| HTTP client | Axios | Required by the brief; instance with a JWT request interceptor |
| Backend | Node.js + Express 4 | Required |
| Database | SQLite | Brief allowed SQLite / PostgreSQL / MongoDB — SQLite chosen |
| Query builder | Knex.js | Brief required Knex **or** Mongoose — Knex (with SQLite) |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` | 7-day Bearer tokens, hashed passwords |
| Version control | Git | Public GitHub repository |

---

## Project Structure

```
├── client/                      # React frontend (Vite)
│   └── src/
│       ├── components/          # Navbar, TemplateCard, PreviewModal, NotificationBell,
│       │                        # CompareModal, CollectionPickerModal, FeedbackModal,
│       │                        # RequestCategoryModal, ProtectedRoute, ScrollToTop, BackButton
│       ├── context/             # AuthContext (JWT in localStorage), ToastContext
│       ├── lib/                 # api (axios + interceptor), customize, recent
│       ├── pages/               # Home, Templates, Favorites, Collections, Login,
│       │                        # Register, Profile, SubmitTemplate, AdminReviews
│       ├── App.jsx              # Route table + navbar + footer
│       └── main.jsx             # React entry point / providers
└── server/                      # Express API
    └── src/
        ├── middleware/          # auth (JWT), requireAdmin
        ├── migrations/          # 8 Knex migrations (users, templates, favorites, ratings,
        │                        # category_suggestions, feedback, collections, notifications)
        ├── routes/              # auth, templates, favorites, ratings, feedback,
        │                        # submissions, admin, notifications, collections, me
        ├── scripts/             # make-admin.js (promote/demote a user)
        ├── services/            # notifications helper
        ├── seeds/               # 18 sample templates across 6 categories
        └── index.js             # App entry: CORS, JSON, route mounts, error handlers
```

---

## Setup

### Prerequisites

- **Node.js 18+** and npm
- The database is SQLite (file-based) — no separate database server is required.

### 1. Backend (`server`)

```bash
cd server
npm install
npm run migrate   # create all tables
npm run seed      # insert 18 sample templates (6 categories × 3)
npm run dev       # runs on http://localhost:5000  (use `npm start` for non-watch)
```

Optional environment variables (create `server/.env`):

```bash
PORT=5000
JWT_SECRET=replace-me-with-a-long-random-string
```

> If `JWT_SECRET` is not set, a development fallback secret is used. Do **not** rely on the fallback in production.

### 2. Frontend (`client`)

```bash
cd client
npm install
npm run dev       # runs on http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` requests to the backend on port 5000.

### 3. Optional — create an admin account

The review queue (`/admin/reviews`) is admin-only. Promote a registered user by email:

```bash
cd server
npm run make-admin you@example.com           # grant admin
npm run make-admin you@example.com --remove  # revoke admin
```

Log out and back in afterwards so the new role is included in the JWT.

---

## Required Features (from the assessment brief)

Every item below is taken directly from `Gnxtace_Full_Stack_Intern_Assessment.md`.

### Core Features (brief §1)

| # | Requirement | Status | Where |
|---|---|---|---|
| 1 | User registration and login | ✅ | `POST /api/auth/register`, `POST /api/auth/login`; `client/src/pages/Login.jsx`, `Register.jsx` |
| 2 | Viewing a list of available templates | ✅ | `GET /api/templates`; `client/src/pages/Templates.jsx` |
| 3 | Marking templates as favorites | ✅ | `POST/DELETE /api/favorites/:templateId`; favorite button on `TemplateCard.jsx` |
| 4 | Dedicated **My Favorites** section | ✅ | `GET /api/favorites`; `client/src/pages/Favorites.jsx` (route `/favorites`) |

### Backend Requirements (brief §3)

#### §3.1 Authentication

- ✅ Register + login endpoints (`/api/auth/register`, `/api/auth/login`).
- ✅ **JWT** issued on success (7-day expiry, sent as `Authorization: Bearer <token>`).
- ✅ Passwords **hashed with bcryptjs** before storage (`password_hash`).
- ✅ Registration and login inputs validated (name, email format, password length).
- ✅ Correct HTTP status codes and consistent JSON responses (`{ success, message, ... }`).

#### §3.2 Templates API

Required `templates` fields — all present:

| Field | Description |
|---|---|
| `id` | Unique template identifier |
| `name` | Template name |
| `description` | Description of the template |
| `thumbnail_url` | URL of the thumbnail image |
| `category` | Template category |

Required routes — all implemented (favorites require auth):

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/templates` | Public | List all templates |
| `GET` | `/api/templates/:id` | Public | Details for one template |
| `POST` | `/api/favorites/:templateId` | JWT | Add a template to the user's favorites |
| `GET` | `/api/favorites` | JWT | List the user's favorited templates |

#### §3.3 Database Setup and Seed Data

- ✅ Tables created via Knex migrations (`npm run migrate`).
- ✅ Seeded with **18 sample templates** (requirement: *at least five*), spanning 6 categories.

#### §3.4 Validation and Error Handling

- ✅ Input validation on registration, login, favorites, ratings, feedback, submissions and collections.
- ✅ Appropriate HTTP status codes (200/201/400/401/403/404/409/500).
- ✅ Consistent JSON responses for successes and errors; central 404 + error handler in `server/src/index.js`.

### Frontend Requirements (brief §4)

#### §4.1 Required Pages

| Route | Purpose | Status |
|---|---|---|
| `/register` | User registration form | ✅ |
| `/login` | User login form | ✅ |
| `/templates` | Display all available templates | ✅ |
| `/favorites` | Display the logged-in user's favorites | ✅ |

#### §4.2 Required Functionality

- ✅ JWT stored in browser **localStorage** after login (`AuthContext.jsx`).
- ✅ Backend calls made with **Axios** (`client/src/lib/api.js`, with a Bearer-token request interceptor).
- ✅ Templates rendered as cards with a **Favorite** button (`TemplateCard.jsx`).
- ✅ Favorited state is **visually indicated** (filled star / "Saved" styling, synced across the grid and preview modal).
- ✅ Favorites page is **restricted** — unauthenticated users are redirected to `/login` (`ProtectedRoute.jsx`).

#### §4.3 User Interface and Experience

- ✅ Clean, responsive, mobile-first layout (Tailwind breakpoints, collapsible nav).
- ✅ Studio styling with **Tailwind CSS**.
- ✅ Each card shows an **image, title and description** (plus category and rating).

---

## Added Extra (beyond the requirements)

Everything in this section goes beyond the four core requirements.

### A. Bonus features named in the brief (§5)

| Bonus item | Status | Details |
|---|---|---|
| Search on the Templates page | ✅ | Debounced search by name/description (`?search=`) |
| Category-based filtering | ✅ | Category chips + `?category=` (`GET /api/templates/categories`) |
| Logout button | ✅ | In the navbar menu and Profile → Settings |
| Protected routes | ✅ | `ProtectedRoute` guards `/favorites`, `/collections`, `/profile`, `/submit`, `/admin/reviews` |
| Deploy backend (Render/Vercel) | ⛔ Not implemented | Runs locally only |
| Deploy frontend (Vercel/Netlify) | ⛔ Not implemented | Runs locally only |

### B. Extra features (not requested at all)

- **Template Submission Portal** — authenticated users submit their own templates (`/submit`), which enter a `pending` state and stay hidden from the public catalogue until approved.
  - `POST /api/submissions`, `client/src/pages/SubmitTemplate.jsx`
- **Admin Review Queue** — admins approve or reject submissions (with an optional rejection reason) from `/admin/reviews`; approving publishes the template and notifies the author.
  - `GET/PATCH /api/admin/submissions/...`, `client/src/pages/AdminReviews.jsx`, `requireAdmin` middleware
- **Ratings & Reviews** — 1–5 star ratings per user, aggregated `avg_rating`/`rating_count`; the user's own reviews are listed in the Profile.
  - `GET/POST /api/ratings/:templateId`, `GET /api/me/ratings`
- **Collections (private folders)** — group templates into named collections; a template can belong to many collections. Full CRUD plus add/remove with cover previews.
  - `/api/collections/...`, `client/src/pages/Collections.jsx`, `CollectionPickerModal.jsx`
- **In-app Notifications** — a navbar bell with an unread badge, individual/all mark-as-read, deep links, and per-type delivery preferences (welcome message, submission approvals).
  - `/api/notifications/...`, `client/src/components/NotificationBell.jsx`
- **Customization Playground** — re-color and re-font any template's live preview at runtime (primary/secondary color pickers, font presets, desktop/mobile viewport), without editing the stored HTML. Works by overriding `:root` CSS custom properties.
  - `client/src/lib/customize.js`, `PreviewModal.jsx`
- **Live Sandboxed Preview** — templates render their real HTML in a sandboxed iframe inside a browser-style frame.
- **Compare Templates** — select up to 3 templates and compare them side-by-side (name, category, description, rating, rating count).
  - `client/src/components/CompareModal.jsx`
- **Category Suggestions & Voting** — users request new categories and upvote others; votes are persisted per browser.
  - `GET/POST /api/templates/categories/suggest`, `.../vote`, `RequestCategoryModal.jsx`
- **Feedback form** — a footer popup that stores user feedback.
  - `POST /api/feedback`, `client/src/components/FeedbackModal.jsx`
- **Tabbed Profile Hub** — Overview (stats, collections, recently viewed), Reviews, Submissions (with status chips + rejection reasons), and Settings (rename account, notification preferences, logout).
  - `client/src/pages/Profile.jsx`
- **Account rename** — change your display name from Profile → Settings.
  - `PATCH /api/auth/me`
- **Recently viewed** — a localStorage-backed strip (last 6 templates) shown on the Templates page and Profile.
  - `client/src/lib/recent.js`
- **Pagination, sorting & load-more** — page/limit, sort by newest/oldest/name.
- **Dark mode** — default-dark theme with a persisted toggle (`localStorage`).
- **Toast notifications** — transient success/error/info feedback across the app (`ToastContext.jsx`).
- **Role-based access** — `user`/`admin` roles in the JWT with a `requireAdmin` guard and a `make-admin` CLI.
- **Input hardening** — centralized JSON error handling, `409` conflict responses (duplicate favorite/collection/category), and 404s that don't leak ownership.

---

## API Reference

Base URL: `http://localhost:5000/api` · Auth column: **Public**, **JWT**, or **JWT + admin**.
The **Req?** column marks the four endpoints the brief explicitly required.

| Method | Endpoint | Auth | Req? | Description |
|---|---|---|---|---|
| GET | `/health` | Public | | Health check |
| POST | `/auth/register` | Public | | Register a user; returns JWT + user |
| POST | `/auth/login` | Public | | Log in; returns JWT + user |
| GET | `/auth/me` | JWT | | Current user profile (+ `favorites_count`) |
| PATCH | `/auth/me` | JWT | | Rename the current user |
| GET | `/templates` | Public | ✅ | List templates (`?search`, `?category`, `?sort`, `?page`, `?limit`) |
| GET | `/templates/:id` | Public | ✅ | One template (incl. `preview_html`) |
| GET | `/templates/categories` | Public | | Distinct categories |
| GET | `/templates/categories/suggest` | Public | | List category suggestions by votes |
| POST | `/templates/categories/suggest` | Public | | Request a new category |
| POST | `/templates/categories/suggest/:id/vote` | Public | | Upvote a category suggestion |
| POST | `/favorites/:templateId` | JWT | ✅ | Add to favorites |
| GET | `/favorites` | JWT | ✅ | List favorites |
| DELETE | `/favorites/:templateId` | JWT | | Remove from favorites |
| GET | `/ratings/:templateId` | Public (optional JWT) | | Rating aggregate (+ `my_score`) |
| POST | `/ratings/:templateId` | JWT | | Set/update your 1–5 rating |
| POST | `/feedback` | Public | | Submit feedback |
| GET | `/submissions` | JWT | | List your submissions |
| POST | `/submissions` | JWT | | Create a submission (`pending`) |
| GET | `/submissions/:id` | JWT | | Get one of your submissions |
| PATCH | `/submissions/:id` | JWT | | Edit a submission (pending only) |
| DELETE | `/submissions/:id` | JWT | | Delete a submission (pending only) |
| GET | `/admin/submissions` | JWT + admin | | List submissions (`?status=`) |
| GET | `/admin/submissions/:id` | JWT + admin | | Submission detail (+ `preview_html`) |
| PATCH | `/admin/submissions/:id` | JWT + admin | | Approve / reject / reopen |
| GET | `/notifications` | JWT | | Notifications + unread count |
| PATCH | `/notifications/read` | JWT | | Mark read (`{ ids }` or `{ all: true }`) |
| GET | `/notifications/preferences` | JWT | | Get delivery preferences |
| PUT | `/notifications/preferences` | JWT | | Update delivery preferences |
| GET | `/collections` | JWT | | List collections (+ covers, `?template_id=`) |
| POST | `/collections` | JWT | | Create a collection |
| GET | `/collections/:id` | JWT | | Collection detail + templates |
| PATCH | `/collections/:id` | JWT | | Rename a collection |
| DELETE | `/collections/:id` | JWT | | Delete a collection |
| POST | `/collections/:id/templates` | JWT | | Add a template to a collection |
| DELETE | `/collections/:id/templates/:templateId` | JWT | | Remove a template from a collection |
| GET | `/me/ratings` | JWT | | Your ratings (joined with template info) |

Send the JWT as `Authorization: Bearer <token>`.

---

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Accounts: `name`, unique `email`, `password_hash`, `role` (`user`/`admin`) |
| `templates` | Catalogue: `name`, `description`, `thumbnail_url`, `category`, `preview_html`, `author_id`, `status` (`pending`/`approved`/`rejected`), `rejection_reason` |
| `favorites` | `user_id` × `template_id` (unique pair) |
| `ratings` | `user_id` × `template_id` (unique pair) + `score` 1–5 |
| `collections` | Private per-user folders (`user_id`, `name`) |
| `collection_templates` | `collection_id` × `template_id` (unique pair) |
| `category_suggestions` | Community category requests (`name`, `votes`) |
| `feedback` | Submitted feedback (`name`, `email`, `message`) |
| `notifications` | In-app notifications (`user_id`, `type`, `title`, `body`, `link`, `read`) |
| `user_notification_preferences` | Per-user delivery toggles (`welcome`, `template_approval`) |

All schema changes are versioned Knex migrations in `server/src/migrations/` (with rollbacks).

---

## npm Scripts

### server

| Script | Command | Purpose |
|---|---|---|
| `start` | `node src/index.js` | Run the API |
| `dev` | `node --watch src/index.js` | Run with auto-reload |
| `migrate` | `knex migrate:latest` | Apply migrations |
| `seed` | `knex seed:run` | Seed sample data (destructive — replaces templates) |
| `make-admin` | `node src/scripts/make-admin.js` | Promote/demote a user by email |

### client

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Dev server (http://localhost:5173) |
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Preview the production build |

---

## Submission Checklist

From the brief's final checklist — all requirements satisfied:

- [x] Registration and login work correctly.
- [x] Passwords are hashed before being stored (bcryptjs).
- [x] JWT authentication is implemented.
- [x] The templates API returns the available templates.
- [x] Users can add templates to favorites.
- [x] The Favorites page displays the logged-in user's favorites.
- [x] The database contains at least five sample templates (18 seeded).
- [x] Input validation and error handling are in place.
- [x] The frontend communicates with the backend using Axios.
- [x] The UI is responsive and displays template images, titles, and descriptions.
- [x] Both `client/` and `server/` are included in the repository.
- [x] `README.md` contains setup instructions, the tech stack, and contact information.

---

## Contact

**Malaravan** — [malaravan212003@gmail.com](mailto:malaravan212003@gmail.com)
