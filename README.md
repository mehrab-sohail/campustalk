# CampusTalk

Campus discussion and community platform for the Web Programming project, Fall 2026. Students can post in categories, comment, react, bookmark and report content, and a moderator handles reports, categories and announcements.

## Live demo

https://campustalk-jet.vercel.app/login

The live demo runs the frontend with built-in sample data stored in the browser, so no backend is needed. Log in with a sample account:
- Student: `ali@campustalk.test` / `Student123`
- Moderator: `moderator@campustalk.test` / `Moderator123`

The full version with the real backend and database runs on your own computer (see "Run the full project" below).

## Technologies

Frontend (`client/`):
- React (Vite) with JavaScript
- Redux Toolkit for login state
- React Router
- Bootstrap, with a custom FAST-NUCES color theme and Poppins and Roboto fonts
- TypeScript interfaces for the data models (`client/src/types/models.ts`)

Backend (`server/`):
- Node.js and Express
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for login, bcryptjs for password hashing
- CORS, dotenv

## Project status

Both the frontend and the backend are finished and connected.

Frontend:
- Login and signup with form validation, profile edit
- Navbar, routing and protected routes (student and moderator)
- Feed with post cards, loading, empty and error states
- Search, category filter, sort (newest or most liked) and pagination
- Top posts sidebar with this week and all time views
- Create, edit and delete posts with form validation
- Post detail page with comments (add, edit and delete your own)
- Like and dislike (one per user per post) and bookmarks
- Report posts and comments with a reason
- Notifications page with mark as read
- My Activity page: my posts, my comments and bookmarks
- Moderator page: review reports, hide content and resolve reports
- Category management: add, rename, archive and delete
- Announcements: the moderator publishes, pins and deletes them, and they show on the feed

Backend:
- REST API under `/api` with token login (`Authorization: Bearer <token>`)
- Users, categories, posts, comments, reactions, bookmarks, reports, notifications and announcements stored in MongoDB
- Role checks on the server: moderator endpoints return 403 for students, and only the author can edit or delete their own post or comment
- One like or dislike per user per post (unique rule on user and post in the database)
- Signup always creates a student account
- Hidden posts and comments are not returned to normal users
- Input validation on the server as well as in the frontend
- Seed script that fills the database with sample data

## Project structure

```
campustalk/
  client/   React frontend (Vite)
  server/   Express backend (routes, models, middleware, seed script)
  docs/     API_CONTRACT.md (endpoints and response shapes)
```

## Run the full project

You need Node.js and a MongoDB database (a local MongoDB or a free MongoDB Atlas cluster).

### 1. Start the backend

```
cd server
npm install
```

Create a file named `.env` inside the `server` folder with:

```
MONGO_URI=your MongoDB connection string
JWT_SECRET=any long random text
PORT=5000
```

Then fill the database with sample data and start the server:

```
npm run seed
npm run dev
```

The server runs on http://localhost:5000 and the API is under `/api`. Open http://localhost:5000/api/health to check that it is running. Running `npm run seed` again clears the database and recreates the sample data.

### 2. Start the frontend

In a second terminal:

```
cd client
npm install
```

Copy `client/.env.example` to `client/.env` and set:

```
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:5000/api
```

Then start it:

```
npm run dev
```

Open http://localhost:5173. The backend only accepts requests from this address (CORS).

### Frontend only (no backend)

If `VITE_USE_MOCK=true` in `client/.env`, the app uses built-in sample data stored in the browser, so you do not need the server or a database. This is how the live demo runs.

## Sample accounts (fictional)

- Moderator: `moderator@campustalk.test` / `Moderator123`
- Students: `ali@campustalk.test`, `sara@campustalk.test`, `hamza@campustalk.test` / `Student123`

With the backend, these accounts exist after `npm run seed`. In mock mode they are built in.

## API overview

All routes start with `/api`. Every route except signup, login and the health check needs a login token.

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/signup`, `POST /auth/login` |
| Profile | `GET /users/me`, `PUT /users/me`, `GET /users/me/posts`, `GET /users/me/comments`, `GET /users/me/bookmarks` |
| Posts | `GET /posts` (search, category, sort, pagination), `GET /posts/top`, `GET /posts/:id`, `POST /posts`, `PUT /posts/:id`, `DELETE /posts/:id` |
| Comments | `GET /posts/:id/comments`, `POST /posts/:id/comments`, `PUT /comments/:id`, `DELETE /comments/:id` |
| Reactions | `PUT /posts/:id/reaction`, `DELETE /posts/:id/reaction` |
| Bookmarks | `PUT /posts/:id/bookmark`, `DELETE /posts/:id/bookmark` |
| Reports | `POST /reports`, `GET /reports` (moderator), `PUT /reports/:id/hide` (moderator), `PUT /reports/:id/resolve` (moderator) |
| Categories | `GET /categories`, `POST`, `PUT /:id`, `DELETE /:id` (moderator for changes) |
| Notifications | `GET /notifications`, `PUT /notifications/:id/read` |
| Announcements | `GET /announcements`, `POST`, `PUT /:id` (pin or unpin), `DELETE /:id` (moderator for changes) |

The exact request and response shapes are in [docs/API_CONTRACT.md](docs/API_CONTRACT.md).

## Git workflow

Each feature was developed on its own branch and merged into `main` through a Pull Request. The frontend and the backend were built by two team members on separate branches (`feature/...` and `feature/backend`).

## Disclaimer

CampusTalk is a student project. It is not an official FAST-NUCES website.