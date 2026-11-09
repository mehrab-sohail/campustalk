# CampusTalk

Campus discussion and community platform for the Web Programming project, Fall 2026. Students can post in categories, comment, react, bookmark and report content, and a moderator handles reports, categories and announcements.

## Technologies

- React (Vite) with JavaScript
- Redux Toolkit for login state
- React Router
- Bootstrap, with a custom FAST-NUCES color theme and Poppins and Roboto fonts
- TypeScript interfaces for the data models (`client/src/types/models.ts`)
- Node.js, Express and a database (backend, built separately)

## Current Status

Done (frontend):
- Project setup with React (Vite) and Bootstrap
- Folder structure, data model types and a mock API service with sample data
- Redux store and auth slice (login saved in Local Storage)
- Navbar, routing and protected routes (student and moderator)
- Login and signup pages with form validation
- Profile edit page
- FAST-NUCES color theme, Poppins and Roboto fonts
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
- Moderation notifications for hidden content and reviewed reports
- Announcements: the moderator publishes, pins and deletes them, and they show on the feed

Not yet:
- Backend (Node.js, Express, database) and connecting the frontend to it

## Run the frontend

```
cd client
npm install
npm run dev
```

Copy `client/.env.example` to `client/.env`. With `VITE_USE_MOCK=true` the app uses built-in sample data stored in the browser, so no backend is needed.

Sample accounts (fictional):
- Student: `ali@campustalk.test` / `Student123`
- Moderator: `moderator@campustalk.test` / `Moderator123`

## For the backend developer

Start here. The frontend is finished and works with mock data, so your job is to build a server that behaves the same way.

1. **Read `docs/API_CONTRACT.md` first.** It lists every endpoint, the exact response shapes, the error format, the validation rules and the seed data.
2. **The mock code is your second spec.** Every function in `client/src/services/api.js` has a mock branch (`if (USE_MOCK)`) that shows the exact logic the matching endpoint needs: who is allowed to do it, which errors to return, and what must be deleted along with a post. Follow it function by function.
3. **Data shapes** are also written as TypeScript interfaces in `client/src/types/models.ts`.

Setup:
- Clone the repository, then create a branch for your work: `git checkout -b feature/backend`
- Put your code in a new `server/` folder next to `client/`. Do not edit `client/`.
- Run the server on port **5000**, with all routes under `/api` (for example `http://localhost:5000/api/posts`).
- Allow requests from `http://localhost:5173` (CORS).
- Add a seed script that creates the sample data from the contract, including the moderator account.
- Open Pull Requests into `main`, like the frontend does.

Rules the server must enforce itself (hiding a button in the frontend is not enough):
- Only the author may edit or delete their own post or comment.
- Moderator endpoints (reports, categories, announcements) return 403 for students.
- One like or dislike per user per post: use a unique rule on (user, post) in the database.
- The signup endpoint always creates a student. It must ignore any `role` in the request.
- Hidden posts and comments are not returned by any endpoint.
- Validate every input on the server too, with the same limits as in the contract.
- Data must survive a server restart.
- Login uses a token: the frontend sends `Authorization: Bearer <token>`.

To test with the real backend, set `VITE_USE_MOCK=false` in `client/.env`, start the server, and restart the frontend with `npm run dev`.

## Documentation

The backend API is described in [docs/API_CONTRACT.md](docs/API_CONTRACT.md).

## Git workflow

Each feature is developed on its own branch and merged into `main` through a Pull Request.

## Disclaimer

CampusTalk is a student project. It is not an official FAST-NUCES website.