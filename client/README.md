# CampusTalk

CampusTalk is a campus discussion platform where students post in categories, comment, react with a like or dislike, bookmark posts and report content. A moderator keeps the platform tidy and publishes announcements.

**Student:** Mehrab Sohail
**Course:** Web Programming, Fall 2026

This repository currently contains the **frontend**. The backend (Node.js, Express and a database) is being built separately and will be added in a `server/` folder.

## Technologies

- React (Vite) with JavaScript
- Redux Toolkit and React Redux (login state)
- React Router
- Bootstrap 5 with custom CSS (FAST-NUCES colors, Poppins and Roboto fonts)
- TypeScript interfaces for the data models (`client/src/types/models.ts`)
- fetch with async/await, using a mock API until the backend is ready

## Current Status

### Done

- Vite React project with Bootstrap, folder structure and TypeScript data models
- API contract for the backend (`docs/API_CONTRACT.md`)
- Mock API that stores sample data in Local Storage, so the app works without a backend
- Routing with protected pages and a moderator-only route
- Login and signup with form validation
- Redux store for login state, kept after a page refresh
- Profile page: view and edit name and bio
- FAST-NUCES color theme
- Design refresh: Poppins and Roboto fonts, white navbar and navy footer
- Feed page with post cards and loading, empty and error states
- Feed search, category filter, sort (newest or most liked) and pagination
- Top posts sidebar with this week and all time views
- Polished styling for the search bar, post cards and pagination

### Not yet done

- Create, edit and delete posts
- Post detail page with comments
- Like and dislike (one per user per post) and bookmarks
- Report content and notifications
- My Activity page
- Moderator page: reports, hide content, categories
- Announcements with pin
- Connecting to the real backend, final testing and cleanup

## How to run

1. Open a terminal in the `client` folder:

   ```
   cd client
   ```

2. Install the packages:

   ```
   npm install
   ```

3. Create a file named `.env` in the `client` folder. You can copy `.env.example`:

   ```
   VITE_USE_MOCK=true
   VITE_API_URL=http://localhost:5000/api
   ```

   With `VITE_USE_MOCK=true` the app uses sample data and needs no backend. Set it to `false` to use the real backend. Never commit `.env`.

4. Start the app:

   ```
   npm run dev
   ```

5. Open http://localhost:5173/

## Sample accounts (mock data)

| Role | Email | Password |
|---|---|---|
| Moderator | moderator@campustalk.test | Moderator123 |
| Student | ali@campustalk.test | Student123 |
| Student | sara@campustalk.test | Student123 |
| Student | hamza@campustalk.test | Student123 |

## For the backend developer

Read `docs/API_CONTRACT.md` first. It lists every endpoint, the data shapes, the validation rules and the sample data the frontend expects. The frontend sends the login token as `Authorization: Bearer <token>`.

## Git workflow

Each feature is developed on its own branch and merged into `main` through a Pull Request.

## Disclaimer

CampusTalk is a student project. It is not an official FAST-NUCES website.