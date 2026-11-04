# CampusTalk API Contract (v1)

Written by the frontend developer from the project proposal. The frontend is built first against mock data that follows this file exactly. The backend developer implements these endpoints so the frontend works by switching one setting.

**If you need to change anything here, change this file and tell the frontend developer.** Don't change a field name in code only.

---

## 1. For the backend developer: start here

1. Pull the repo. The frontend is in `client/`. Create your code in `server/` next to it.
2. Read this file once, then build in this order (each step can be tested on its own):
   1. Users and auth (signup, login, token middleware, role middleware)
   2. Categories
   3. Posts (including search, filter, sort, pagination, top posts)
   4. Comments
   5. Reactions
   6. Bookmarks and "my activity"
   7. Reports and moderation (hide, resolve)
   8. Notifications
   9. Announcements
   10. Seed script (see section 10)
3. Run the frontend against your server:
   - In `client/.env` set `VITE_USE_MOCK=false` and `VITE_API_URL=http://localhost:5000/api`
   - `cd client`, `npm install`, `npm run dev` (opens http://localhost:5173)
   - Run your server on **port 5000**.
4. Database: MongoDB or MySQL, your choice. Data must survive a server restart.

### Tips that will save you time
- Express matches routes in order. Define `GET /posts/top` **before** `GET /posts/:id`.
- Return `id` (a string) on every object, not `_id` (MongoDB) or a numeric key. Map it in your response.
- One reaction per user per post: enforce it in the database with a unique index on (user, post), not only in code.
- Moderator routes and "edit only your own" checks must be enforced in the backend. The frontend also hides buttons, but that is not security.
- Passwords: the proposal says hashing is not graded. Plain storage is acceptable, but `bcrypt` is easy if you have time.

---

## 2. General rules

| Topic | Rule |
|---|---|
| Base URL | `http://localhost:5000/api` |
| Format | JSON in, JSON out |
| CORS | Allow origin `http://localhost:5173` |
| Auth | Token (JWT). Login returns a token. The frontend sends `Authorization: Bearer <token>` on every request except signup and login |
| IDs | String `id` on every object |
| Dates | ISO 8601 strings, for example `2026-11-04T13:30:00.000Z` |
| Passwords | Never returned in any response |

### Status codes
| Code | When |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | OK, no body (delete) |
| 400 | Validation failed |
| 401 | No token or invalid token |
| 403 | Logged in but not allowed (wrong role, or not the owner) |
| 404 | Not found (or hidden content for a non-moderator) |
| 409 | Conflict (duplicate email, duplicate category name, deleting a category that has posts) |

### Error response (always this shape)
```json
{ "message": "Title is required", "errors": { "title": "Title is required" } }
```
`message` is always present. `errors` (field name → message) is optional and used for 400 validation errors so the frontend can show the message under the right field.

### Paginated list response
```json
{ "items": [ ], "page": 1, "pageSize": 10, "total": 42, "totalPages": 5 }
```

### Validation rules (frontend and backend use the same ones)
| Field | Rule |
|---|---|
| name | required, 2 to 50 characters |
| email | required, valid email format, unique |
| password | required, at least 6 characters |
| bio | optional, at most 300 characters |
| post title | required, 1 to 120 characters |
| post body | required, 1 to 5000 characters |
| comment body | required, 1 to 1000 characters |
| report reason | required, 3 to 300 characters |
| category name | required, 2 to 40 characters, unique |
| announcement title / body | required, same limits as post |

---

## 3. Data models (what the frontend expects back)

### User
```json
{ "id": "u1", "name": "Ali Khan", "email": "ali@campustalk.test", "role": "student", "bio": "CS, 5th semester", "createdAt": "..." }
```
`role` is `"student"` or `"moderator"`.

### Category
```json
{ "id": "c1", "name": "Academics", "archived": false }
```

### Post
```json
{
  "id": "p1",
  "title": "Best way to prepare for the web exam?",
  "body": "...",
  "category": { "id": "c1", "name": "Academics" },
  "author": { "id": "u1", "name": "Ali Khan" },
  "createdAt": "...",
  "updatedAt": "...",
  "likes": 5,
  "dislikes": 1,
  "commentCount": 3,
  "myReaction": "like",
  "bookmarked": false
}
```
- `myReaction` is `"like"`, `"dislike"` or `null`, for the logged-in user.
- `bookmarked` is for the logged-in user.
- `commentCount` does not count hidden comments.

### Comment
```json
{ "id": "m1", "postId": "p1", "postTitle": "Best way to...", "body": "...", "author": { "id": "u2", "name": "Sara" }, "createdAt": "...", "updatedAt": "..." }
```
`postTitle` is only needed in `GET /users/me/comments` (the My Activity page).

### Report
```json
{
  "id": "r1",
  "targetType": "post",
  "targetId": "p1",
  "postId": "p1",
  "targetPreview": "First 100 characters of the reported text...",
  "targetHidden": false,
  "reason": "Spam",
  "status": "open",
  "reporter": { "id": "u2", "name": "Sara" },
  "createdAt": "..."
}
```
`targetType` is `"post"` or `"comment"`. `status` is `"open"` or `"resolved"`. `postId` is the post to link to (for a comment report, the comment's post).

### Notification
```json
{ "id": "n1", "type": "comment", "message": "Sara commented on your post", "postId": "p1", "read": false, "createdAt": "..." }
```
`type` is `"comment"` or `"moderation"`.

### Announcement
```json
{ "id": "a1", "title": "Exam schedule released", "body": "...", "pinned": true, "author": { "id": "u0", "name": "Moderator" }, "createdAt": "..." }
```
Storage is your choice: a separate collection/table, or posts with a flag.

---

## 4. Endpoints

Legend for the access column: **Public** = no token. **User** = any logged-in user. **Owner** = the person who created it. **Mod** = moderator only.

### Auth
| Method | URL | Access | Body | Success |
|---|---|---|---|---|
| POST | `/auth/signup` | Public | `{ name, email, password }` | 201 `{ user, token }` (role is always `student`) |
| POST | `/auth/login` | Public | `{ email, password }` | 200 `{ user, token }`. Wrong details: 401 |
| POST | `/auth/logout` | User | none | 204 (optional, the frontend also just discards the token) |

The Moderator account is created by the seed script, never by signup.

### Profile
| Method | URL | Access | Body | Success |
|---|---|---|---|---|
| GET | `/users/me` | User | none | 200 `User` |
| PUT | `/users/me` | User | `{ name, bio }` | 200 `User` |
| GET | `/users/me/posts` | User | none | 200 `Post[]`, newest first |
| GET | `/users/me/comments` | User | none | 200 `Comment[]` (with `postTitle`), newest first |

### Categories
| Method | URL | Access | Body | Success |
|---|---|---|---|---|
| GET | `/categories` | User | none | 200 `Category[]`. Archived ones are excluded unless `?includeArchived=true` (Mod only) |
| POST | `/categories` | Mod | `{ name }` | 201 `Category` |
| PUT | `/categories/:id` | Mod | `{ name?, archived? }` | 200 `Category` (rename, archive or unarchive) |
| DELETE | `/categories/:id` | Mod | none | 204. If the category has posts: 409 (archive it instead) |

Posts in an archived category still show everywhere. The category just can't be chosen for **new** posts (creating a post with an archived category returns 400).

### Posts
| Method | URL | Access | Notes |
|---|---|---|---|
| GET | `/posts` | User | Query: `search`, `category` (category id), `sort` (`newest` or `liked`), `page`, `pageSize` (default 10). Returns the paginated response with `Post` items. |
| GET | `/posts/top` | User | Query: `range` (`all` or `week`), `limit` (default 5). Returns `Post[]` ranked by `likes`, highest first. `week` means posts created in the last 7 days. |
| GET | `/posts/:id` | User | 200 `Post`. Hidden posts: 404 (Mod can still read them) |
| POST | `/posts` | User | Body `{ title, body, categoryId }` → 201 `Post` |
| PUT | `/posts/:id` | Owner | Body `{ title, body, categoryId }` → 200 `Post`. Not the owner: 403 |
| DELETE | `/posts/:id` | Owner | 204. Not the owner: 403 |

- `search` matches the title or the body, case-insensitive.
- `sort=liked` means most `likes` first, ties broken by newest.
- Hidden posts and announcements never appear in `GET /posts` or `GET /posts/top`.

### Comments
| Method | URL | Access | Body | Success |
|---|---|---|---|---|
| GET | `/posts/:id/comments` | User | none | 200 `Comment[]`, oldest first, hidden ones excluded |
| POST | `/posts/:id/comments` | User | `{ body }` | 201 `Comment`. Also creates a `comment` notification for the post's author (not when the author comments on their own post) |
| PUT | `/comments/:id` | Owner | `{ body }` | 200 `Comment` |
| DELETE | `/comments/:id` | Owner | none | 204 |

### Reactions (one per user per post)
| Method | URL | Access | Body | Success |
|---|---|---|---|---|
| PUT | `/posts/:id/reaction` | User | `{ type: "like" or "dislike" }` | 200 `{ likes, dislikes, myReaction }`. Creates the reaction, or changes it if one exists |
| DELETE | `/posts/:id/reaction` | User | none | 200 `{ likes, dislikes, myReaction: null }` |

### Bookmarks
| Method | URL | Access | Success |
|---|---|---|---|
| GET | `/bookmarks` | User | 200 `Post[]` (the user's bookmarked posts) |
| PUT | `/posts/:id/bookmark` | User | 200 `{ bookmarked: true }` (safe to call twice) |
| DELETE | `/posts/:id/bookmark` | User | 200 `{ bookmarked: false }` |

### Reports and moderation
| Method | URL | Access | Body | Success |
|---|---|---|---|---|
| POST | `/reports` | User | `{ targetType, targetId, reason }` | 201 `Report` |
| GET | `/reports` | Mod | Query: `status` (`open` or `resolved`, optional) | 200 `Report[]`, newest first |
| PATCH | `/reports/:id/hide` | Mod | none | 200 `Report`. Hides the reported post or comment (`targetHidden` becomes true) and creates a `moderation` notification for the content's author |
| PATCH | `/reports/:id/resolve` | Mod | none | 200 `Report` (`status` becomes `resolved`) and a `moderation` notification for the reporter |

Hidden content disappears from every normal list and from `commentCount` and the like counts used for ranking.

### Notifications
| Method | URL | Access | Success |
|---|---|---|---|
| GET | `/notifications` | User | 200 `Notification[]` for the current user, newest first |
| PATCH | `/notifications/:id/read` | Owner | 200 `Notification` with `read: true` |

The frontend works out the unread count from the list.

### Announcements
| Method | URL | Access | Body | Success |
|---|---|---|---|---|
| GET | `/announcements` | User | none | 200 `Announcement[]`, pinned first, then newest |
| POST | `/announcements` | Mod | `{ title, body, pinned? }` | 201 `Announcement` |
| PATCH | `/announcements/:id` | Mod | `{ pinned }` | 200 `Announcement` |

---

## 5. Permission summary

| Action | Student | Moderator |
|---|---|---|
| Sign up, log in, edit own profile | Yes | Yes (login only) |
| Create posts and comments | Yes | Yes |
| Edit or delete own post or comment | Yes (own only) | Own only |
| Like or dislike, bookmark | Yes | Yes |
| Report a post or comment | Yes | Yes |
| Manage categories | No | Yes |
| View reports, hide content, resolve | No | Yes |
| Publish or pin announcements | No | Yes |

---

## 6. Notifications: when they are created

| Event | Recipient | Type | Example message |
|---|---|---|---|
| Someone comments on your post | The post's author | `comment` | "Sara commented on your post" |
| Moderator hides your post or comment | The content's author | `moderation` | "Your post was hidden by a moderator" |
| Moderator resolves your report | The reporter | `moderation` | "Your report was reviewed" |

---

## 7. Authentication flow (what the frontend does)

1. Signup or login returns `{ user, token }`.
2. The frontend stores both in Redux and Local Storage, so a refresh keeps you logged in.
3. Every later request sends `Authorization: Bearer <token>`.
4. A 401 response sends the user back to the login page.

---

## 8. Moderator routes

Every route marked **Mod** must check the role in a middleware (`requireModerator`). A student calling it returns 403, even if they know the URL.

---

## 9. Error handling

Use one error-handling middleware at the end of the Express app, so every error uses the shape in section 2.

---

## 10. Seed data (fictional)

The seed script (`npm run seed` in `server/`) should create:

**Accounts**
| Role | Email | Password |
|---|---|---|
| Moderator | `moderator@campustalk.test` | `Moderator123` |
| Student | `ali@campustalk.test` | `Student123` |
| Student | `sara@campustalk.test` | `Student123` |
| Student | `hamza@campustalk.test` | `Student123` |

**Content**
- Categories: Academics, Events, Campus Life, plus one archived category (for testing).
- At least 25 posts across the categories (the frontend shows 10 per page, so this tests pagination). Make some older than 7 days and some within the last 7 days.
- Different like and dislike counts so "most liked" and "top posts" give clear results.
- Several comments, a few bookmarks, a few notifications (some unread).
- At least 2 open reports (one on a post, one on a comment) and 1 resolved report.
- 2 announcements, one pinned.

---

## 11. Change log

| Date | Change | By |
|---|---|---|
| 2026-11-04 | First version | Frontend |
