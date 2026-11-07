# CampusTalk

Campus discussion and community platform for the Web Programming project, Fall 2026. Students can post in categories, comment, react, bookmark and report content, and a moderator handles reports and announcements.

## Technologies

- React (Vite) with JavaScript
- Redux Toolkit for login state
- React Router
- Bootstrap, with a custom FAST-NUCES color theme and Poppins and Roboto fonts
- Node.js, Express and a database (backend, in progress)

## Current Status

Done:
- Project setup with React (Vite) and Bootstrap
- Folder structure, data model types and a mock API service with sample data
- Redux store and auth slice (login saved in Local Storage)
- Navbar, routing and protected routes (student and moderator)
- Login and signup pages with form validation
- Profile edit page
- FAST-NUCES color theme (blue, sky blue, green, gold) and Roboto font
- Design refresh: Poppins and Roboto fonts, white navbar and navy footer
- Feed page with post cards and loading, empty and error states
- Feed search, category filter, sort (newest or most liked) and pagination
- Top posts sidebar with this week and all time views
- Polished styling for the search bar, post cards and pagination
- Create, edit and delete posts with form validation.
- Post detail page with comments (add, edit and delete your own)
- Report posts and comments with a reason
- Notifications page with mark as read

Not yet:
- Create, edit and delete posts, post details and comments
- Likes and dislikes, bookmarks
- Reports, notifications and My Activity
- Moderator pages (reports, categories, announcements)
- Connecting the frontend to the backend
- Post details and comments
- Post details and comments.
## Run the frontend

```
cd client
npm install
npm run dev
```

Copy `client/.env.example` to `client/.env`. With `VITE_USE_MOCK=true` the app uses built-in sample data, so no backend is needed.

Sample accounts (fictional):
- Student: `ali@campustalk.test` / `Student123`
- Moderator: `moderator@campustalk.test` / `Moderator123`

## Documentation

The backend API is described in [docs/API_CONTRACT.md](docs/API_CONTRACT.md).