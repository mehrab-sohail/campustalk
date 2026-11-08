import { getDb, saveDb } from './mockData.js'
import { validatePost, validateCommentBody, validateReportReason, validateCategoryName, validateAnnouncement } from '../utils/postValidators.js'
/**
 * @typedef {import('../types/models').Post} Post
 * @typedef {import('../types/models').Category} Category
 * @typedef {import('../types/models').Paginated<Post>} PostPage
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const API_URL = import.meta.env.VITE_API_URL

// The auth slice (Step 3) saves { user, token } under this key.
export const AUTH_STORAGE_KEY = 'campustalk_auth'

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || null
  } catch {
    return null
  }
}

const getToken = () => getAuth()?.token ?? null
const getCurrentUserId = () => getAuth()?.user?.id ?? null

// Turns { page: 1, search: 'exam' } into "?page=1&search=exam" and skips empty values.
function toQuery(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value)
    }
  })
  const text = query.toString()
  return text ? `?${text}` : ''
}

// One function for every real backend call.
async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong')
    error.status = response.status
    error.fieldErrors = data.errors || {}
    throw error
  }
  return data
}

// Makes the mock feel like a real server, so the loading state is visible.
const delay = (value, ms = 300) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

// Builds a post in the exact shape the API contract describes.
function shapePost(db, post) {
  const userId = getCurrentUserId()
  const reactions = db.reactions.filter((r) => r.postId === post.id)
  const mine = reactions.find((r) => r.userId === userId)
  const author = db.users.find((u) => u.id === post.authorId)
  const category = db.categories.find((c) => c.id === post.categoryId)

  return {
    id: post.id,
    title: post.title,
    body: post.body,
    category: { id: category.id, name: category.name },
    author: { id: author.id, name: author.name },
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    likes: reactions.filter((r) => r.type === 'like').length,
    dislikes: reactions.filter((r) => r.type === 'dislike').length,
    commentCount: db.comments.filter((c) => c.postId === post.id && !c.hidden).length,
    myReaction: mine ? mine.type : null,
    bookmarked: db.bookmarks.some((b) => b.userId === userId && b.postId === post.id),
  }
}

/** @returns {Promise<Category[]>} */
export async function getCategories(includeArchived = false) {
  if (USE_MOCK) {
    const db = getDb()
    return delay(db.categories.filter((c) => includeArchived || !c.archived))
  }
  return request('GET', `/categories${toQuery({ includeArchived: includeArchived || undefined })}`)
}

/**
 * @param {{ page?: number, pageSize?: number, search?: string, categoryId?: string, sort?: 'newest' | 'liked' }} params
 * @returns {Promise<PostPage>}
 */
export async function getPosts({ page = 1, pageSize = 10, search = '', categoryId = '', sort = 'newest' } = {}) {
  if (USE_MOCK) {
    const db = getDb()
    const text = search.trim().toLowerCase()

    const matching = db.posts
      .filter((post) => !post.hidden)
      .filter((post) => !categoryId || post.categoryId === categoryId)
      .filter(
        (post) =>
          !text ||
          post.title.toLowerCase().includes(text) ||
          post.body.toLowerCase().includes(text)
      )
      .map((post) => shapePost(db, post))

    // "liked" sorts by like count; posts with the same count stay newest first.
    matching.sort((a, b) => {
      if (sort === 'liked' && b.likes !== a.likes) return b.likes - a.likes
      return b.createdAt.localeCompare(a.createdAt)
    })

    const start = (page - 1) * pageSize

    return delay({
      items: matching.slice(start, start + pageSize),
      page,
      pageSize,
      total: matching.length,
      totalPages: Math.max(1, Math.ceil(matching.length / pageSize)),
    })
  }
  return request('GET', `/posts${toQuery({ page, pageSize, search: search.trim(), categoryId, sort })}`)
}

// Builds an Error the same way request() does, for the mock server.
function fail(message, status = 400, fieldErrors = {}) {
  const error = new Error(message)
  error.status = status
  error.fieldErrors = fieldErrors
  return error
}

// The password is never sent to the frontend.
function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
    createdAt: user.createdAt,
  }
}

/** @returns {Promise<import('../types/models').AuthResult>} */
export async function login({ email, password }) {
  if (USE_MOCK) {
    const db = getDb()
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    )
    if (!user) throw fail('Wrong email or password', 401)
    return delay({ user: publicUser(user), token: `mock-token-${user.id}` })
  }
  return request('POST', '/auth/login', { email: email.trim(), password })
}

/** @returns {Promise<import('../types/models').AuthResult>} */
export async function signup({ name, email, password }) {
  if (USE_MOCK) {
    const db = getDb()
    const taken = db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (taken) {
      throw fail('That email is already registered', 409, { email: 'That email is already registered' })
    }
    const user = {
      id: `u${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      password,
      role: 'student',
      bio: '',
      createdAt: new Date().toISOString(),
    }
    db.users.push(user)
    saveDb(db)
    return delay({ user: publicUser(user), token: `mock-token-${user.id}` })
  }
  return request('POST', '/auth/signup', { name: name.trim(), email: email.trim(), password })
}

/** @returns {Promise<import('../types/models').User>} */
export async function getProfile() {
  if (USE_MOCK) {
    const db = getDb()
    const user = db.users.find((u) => u.id === getCurrentUserId())
    if (!user) throw fail('Please log in again', 401)
    return delay(publicUser(user))
  }
  return request('GET', '/users/me')
}

/** @returns {Promise<import('../types/models').User>} */
export async function updateProfile({ name, bio }) {
  if (USE_MOCK) {
    const db = getDb()
    const user = db.users.find((u) => u.id === getCurrentUserId())
    if (!user) throw fail('Please log in again', 401)
    user.name = name.trim()
    user.bio = bio.trim()
    saveDb(db)
    return delay(publicUser(user))
  }
  return request('PUT', '/users/me', { name: name.trim(), bio: bio.trim() })
}

/**
 * Top posts by reaction count (likes + dislikes).
 * range "week" = posts from the last 7 days, range "all" = every post.
 * @param {{ range?: 'week' | 'all', limit?: number }} params
 * @returns {Promise<Post[]>}
 */
export async function getTopPosts({ range = 'week', limit = 5 } = {}) {
  if (USE_MOCK) {
    const db = getDb()
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

    const top = db.posts
      .filter((post) => !post.hidden)
      .filter((post) => range !== 'week' || new Date(post.createdAt).getTime() >= weekAgo)
      .map((post) => shapePost(db, post))

    // Most reactions first; posts with the same count stay newest first.
    top.sort(
      (a, b) =>
        b.likes + b.dislikes - (a.likes + a.dislikes) || b.createdAt.localeCompare(a.createdAt)
    )

    return delay(top.slice(0, limit))
  }
  return request('GET', `/posts/top${toQuery({ range, limit })}`)
}

// Checks post fields like the real server will. Throws a 400 error with fieldErrors.
function checkPostFields(db, fields, allowedCategoryId) {
  const errors = validatePost(fields)
  if (!errors.categoryId) {
    const category = db.categories.find((c) => c.id === fields.categoryId)
    const usable = category && (!category.archived || category.id === allowedCategoryId)
    if (!usable) errors.categoryId = 'Please choose an available category'
  }
  if (Object.keys(errors).length > 0) {
    throw fail('Please fix the highlighted fields', 400, errors)
  }
}

/** @returns {Promise<Post>} */
export async function getPost(id) {
  if (USE_MOCK) {
    const db = getDb()
    const post = db.posts.find((p) => p.id === id && !p.hidden)
    if (!post) throw fail('Post not found', 404)
    return delay(shapePost(db, post))
  }
  return request('GET', `/posts/${id}`)
}

/** @returns {Promise<Post>} */
export async function createPost({ title, body, categoryId }) {
  if (USE_MOCK) {
    const db = getDb()
    const userId = getCurrentUserId()
    if (!userId) throw fail('Please log in again', 401)
    checkPostFields(db, { title, body, categoryId })

    const now = new Date().toISOString()
    const post = {
      id: `p${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      categoryId,
      authorId: userId,
      hidden: false,
      createdAt: now,
      updatedAt: now,
    }
    db.posts.push(post)
    saveDb(db)
    return delay(shapePost(db, post))
  }
  return request('POST', '/posts', { title: title.trim(), body: body.trim(), categoryId })
}

/** @returns {Promise<Post>} */
export async function updatePost(id, { title, body, categoryId }) {
  if (USE_MOCK) {
    const db = getDb()
    const post = db.posts.find((p) => p.id === id)
    if (!post) throw fail('Post not found', 404)
    if (post.authorId !== getCurrentUserId()) throw fail('You can only edit your own posts', 403)
    checkPostFields(db, { title, body, categoryId }, post.categoryId)

    post.title = title.trim()
    post.body = body.trim()
    post.categoryId = categoryId
    post.updatedAt = new Date().toISOString()
    saveDb(db)
    return delay(shapePost(db, post))
  }
  return request('PUT', `/posts/${id}`, { title: title.trim(), body: body.trim(), categoryId })
}

// Deleting a post also removes everything that belongs to it.
export async function deletePost(id) {
  if (USE_MOCK) {
    const db = getDb()
    const post = db.posts.find((p) => p.id === id)
    if (!post) throw fail('Post not found', 404)
    if (post.authorId !== getCurrentUserId()) throw fail('You can only delete your own posts', 403)

    db.posts = db.posts.filter((p) => p.id !== id)
    db.comments = db.comments.filter((c) => c.postId !== id)
    db.reactions = db.reactions.filter((r) => r.postId !== id)
    db.bookmarks = db.bookmarks.filter((b) => b.postId !== id)
    db.reports = db.reports.filter((r) => r.postId !== id)
    db.notifications = db.notifications.filter((n) => n.postId !== id)
    saveDb(db)
    return delay(null)
  }
  return request('DELETE', `/posts/${id}`)
}

// Builds a comment in the exact shape the API contract describes.
function shapeComment(db, comment) {
  const author = db.users.find((u) => u.id === comment.authorId)
  return {
    id: comment.id,
    postId: comment.postId,
    body: comment.body,
    author: { id: author.id, name: author.name },
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  }
}

/** @returns {Promise<import('../types/models').Comment[]>} */
export async function getComments(postId) {
  if (USE_MOCK) {
    const db = getDb()
    const post = db.posts.find((p) => p.id === postId && !p.hidden)
    if (!post) throw fail('Post not found', 404)

    const list = db.comments
      .filter((c) => c.postId === postId && !c.hidden)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((c) => shapeComment(db, c))
    return delay(list)
  }
  return request('GET', `/posts/${postId}/comments`)
}

/** @returns {Promise<import('../types/models').Comment>} */
export async function addComment(postId, { body }) {
  if (USE_MOCK) {
    const db = getDb()
    const userId = getCurrentUserId()
    const commenter = db.users.find((u) => u.id === userId)
    if (!commenter) throw fail('Please log in again', 401)

    const post = db.posts.find((p) => p.id === postId && !p.hidden)
    if (!post) throw fail('Post not found', 404)

    const problem = validateCommentBody(body)
    if (problem) throw fail(problem, 400, { body: problem })

    const now = new Date().toISOString()
    const comment = {
      id: `cm${Date.now()}`,
      postId,
      body: body.trim(),
      authorId: userId,
      hidden: false,
      createdAt: now,
      updatedAt: now,
    }
    db.comments.push(comment)

    // The post's author is told about the comment (shown on the Notifications page in Step 13).
    if (post.authorId !== userId) {
      db.notifications.push({
        id: `n${Date.now()}`,
        userId: post.authorId,
        type: 'comment',
        message: `${commenter.name} commented on your post "${post.title}"`,
        postId,
        read: false,
        createdAt: now,
      })
    }

    saveDb(db)
    return delay(shapeComment(db, comment))
  }
  return request('POST', `/posts/${postId}/comments`, { body: body.trim() })
}

/** @returns {Promise<import('../types/models').Comment>} */
export async function updateComment(commentId, { body }) {
  if (USE_MOCK) {
    const db = getDb()
    const comment = db.comments.find((c) => c.id === commentId)
    if (!comment) throw fail('Comment not found', 404)
    if (comment.authorId !== getCurrentUserId()) throw fail('You can only edit your own comments', 403)

    const problem = validateCommentBody(body)
    if (problem) throw fail(problem, 400, { body: problem })

    comment.body = body.trim()
    comment.updatedAt = new Date().toISOString()
    saveDb(db)
    return delay(shapeComment(db, comment))
  }
  return request('PUT', `/comments/${commentId}`, { body: body.trim() })
}

export async function deleteComment(commentId) {
  if (USE_MOCK) {
    const db = getDb()
    const comment = db.comments.find((c) => c.id === commentId)
    if (!comment) throw fail('Comment not found', 404)
    if (comment.authorId !== getCurrentUserId()) throw fail('You can only delete your own comments', 403)

    db.comments = db.comments.filter((c) => c.id !== commentId)
    saveDb(db)
    return delay(null)
  }
  return request('DELETE', `/comments/${commentId}`)
}


// Counts and the current user's reaction for one post, in the shape the API contract describes.
function reactionSummary(db, postId) {
  const userId = getCurrentUserId()
  const reactions = db.reactions.filter((r) => r.postId === postId)
  const mine = reactions.find((r) => r.userId === userId)
  return {
    likes: reactions.filter((r) => r.type === 'like').length,
    dislikes: reactions.filter((r) => r.type === 'dislike').length,
    myReaction: mine ? mine.type : null,
  }
}

/** @returns {Promise<{ likes: number, dislikes: number, myReaction: 'like' | 'dislike' | null }>} */
export async function setReaction(postId, type) {
  if (USE_MOCK) {
    const db = getDb()
    const userId = getCurrentUserId()
    if (!userId) throw fail('Please log in again', 401)
    if (type !== 'like' && type !== 'dislike') throw fail('Reaction must be like or dislike', 400)

    const post = db.posts.find((p) => p.id === postId && !p.hidden)
    if (!post) throw fail('Post not found', 404)

    // One reaction per user per post: change the old one instead of adding a second.
    const existing = db.reactions.find((r) => r.postId === postId && r.userId === userId)
    if (existing) {
      existing.type = type
    } else {
      db.reactions.push({ id: `r${Date.now()}`, postId, userId, type })
    }
    saveDb(db)
    return delay(reactionSummary(db, postId))
  }
  return request('PUT', `/posts/${postId}/reaction`, { type })
}

export async function removeReaction(postId) {
  if (USE_MOCK) {
    const db = getDb()
    const userId = getCurrentUserId()
    if (!userId) throw fail('Please log in again', 401)

    db.reactions = db.reactions.filter((r) => !(r.postId === postId && r.userId === userId))
    saveDb(db)
    return delay(reactionSummary(db, postId))
  }
  return request('DELETE', `/posts/${postId}/reaction`)
}

/** @returns {Promise<{ bookmarked: boolean }>} */
export async function addBookmark(postId) {
  if (USE_MOCK) {
    const db = getDb()
    const userId = getCurrentUserId()
    if (!userId) throw fail('Please log in again', 401)

    const post = db.posts.find((p) => p.id === postId && !p.hidden)
    if (!post) throw fail('Post not found', 404)

    const saved = db.bookmarks.some((b) => b.userId === userId && b.postId === postId)
    if (!saved) {
      db.bookmarks.push({ id: `b${Date.now()}`, userId, postId, createdAt: new Date().toISOString() })
      saveDb(db)
    }
    return delay({ bookmarked: true })
  }
  return request('PUT', `/posts/${postId}/bookmark`)
}

/** @returns {Promise<{ bookmarked: boolean }>} */
export async function removeBookmark(postId) {
  if (USE_MOCK) {
    const db = getDb()
    const userId = getCurrentUserId()
    if (!userId) throw fail('Please log in again', 401)

    db.bookmarks = db.bookmarks.filter((b) => !(b.userId === userId && b.postId === postId))
    saveDb(db)
    return delay({ bookmarked: false })
  }
  return request('DELETE', `/posts/${postId}/bookmark`)
}

/** @returns {Promise<{ id: string, status: 'open' }>} */
export async function createReport({ targetType, targetId, reason }) {
  if (USE_MOCK) {
    const db = getDb()
    const userId = getCurrentUserId()
    if (!userId) throw fail('Please log in again', 401)
    if (targetType !== 'post' && targetType !== 'comment') {
      throw fail('Target must be a post or a comment', 400)
    }

    const problem = validateReportReason(reason)
    if (problem) throw fail(problem, 400, { reason: problem })

    const target =
      targetType === 'post'
        ? db.posts.find((p) => p.id === targetId)
        : db.comments.find((c) => c.id === targetId)
    if (!target) throw fail('That content no longer exists', 404)
    if (target.authorId === userId) throw fail('You cannot report your own content', 400)

    const alreadyReported = db.reports.some(
      (r) =>
        r.reporterId === userId &&
        r.targetType === targetType &&
        r.targetId === targetId &&
        r.status === 'open'
    )
    if (alreadyReported) throw fail('You already reported this', 409)

    const report = {
      id: `rp${Date.now()}`,
      targetType,
      targetId,
      postId: targetType === 'post' ? target.id : target.postId,
      reason: reason.trim(),
      status: 'open',
      reporterId: userId,
      createdAt: new Date().toISOString(),
    }
    db.reports.push(report)
    saveDb(db)
    return delay({ id: report.id, status: report.status })
  }
  return request('POST', '/reports', { targetType, targetId, reason: reason.trim() })
}

/** @returns {Promise<import('../types/models').Notification[]>} */
export async function getNotifications() {
  if (USE_MOCK) {
    const db = getDb()
    const userId = getCurrentUserId()
    if (!userId) throw fail('Please log in again', 401)

    const mine = db.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((n) => ({
        id: n.id,
        type: n.type,
        message: n.message,
        postId: n.postId,
        read: n.read,
        createdAt: n.createdAt,
      }))
    return delay(mine)
  }
  return request('GET', '/notifications')
}

export async function markNotificationRead(id) {
  if (USE_MOCK) {
    const db = getDb()
    const notification = db.notifications.find((n) => n.id === id && n.userId === getCurrentUserId())
    if (!notification) throw fail('Notification not found', 404)

    notification.read = true
    saveDb(db)
    return delay({ id, read: true })
  }
  return request('PUT', `/notifications/${id}/read`)
}

/** @returns {Promise<Post[]>} */
export async function getMyPosts() {
  if (USE_MOCK) {
    const db = getDb()
    const userId = getCurrentUserId()
    if (!userId) throw fail('Please log in again', 401)

    const mine = db.posts
      .filter((p) => p.authorId === userId && !p.hidden)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((p) => shapePost(db, p))
    return delay(mine)
  }
  return request('GET', '/users/me/posts')
}

/** @returns {Promise<import('../types/models').Comment[]>} */
export async function getMyComments() {
  if (USE_MOCK) {
    const db = getDb()
    const userId = getCurrentUserId()
    if (!userId) throw fail('Please log in again', 401)

    const mine = db.comments
      .filter((c) => c.authorId === userId && !c.hidden)
      .map((comment) => ({ comment, post: db.posts.find((p) => p.id === comment.postId && !p.hidden) }))
      .filter((entry) => entry.post)
      .sort((a, b) => b.comment.createdAt.localeCompare(a.comment.createdAt))
      .map(({ comment, post }) => ({ ...shapeComment(db, comment), postTitle: post.title }))
    return delay(mine)
  }
  return request('GET', '/users/me/comments')
}

/** @returns {Promise<Post[]>} */
export async function getMyBookmarks() {
  if (USE_MOCK) {
    const db = getDb()
    const userId = getCurrentUserId()
    if (!userId) throw fail('Please log in again', 401)

    const saved = db.bookmarks
      .filter((b) => b.userId === userId)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .map((b) => db.posts.find((p) => p.id === b.postId && !p.hidden))
      .filter(Boolean)
      .map((p) => shapePost(db, p))
    return delay(saved)
  }
  return request('GET', '/users/me/bookmarks')
}


// ---------- Announcements ----------

// Builds an announcement in the exact shape the API contract describes.
function shapeAnnouncement(db, announcement) {
  const author = db.users.find((u) => u.id === announcement.authorId)
  return {
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    pinned: announcement.pinned,
    author: { id: author ? author.id : '', name: author ? author.name : 'Moderator' },
    createdAt: announcement.createdAt,
  }
}

/** @returns {Promise<import('../types/models').Announcement[]>} */
export async function getAnnouncements() {
  if (USE_MOCK) {
    const db = getDb()
    // Pinned announcements first, then the newest.
    const list = db.announcements
      .slice()
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt))
      .map((a) => shapeAnnouncement(db, a))
    return delay(list)
  }
  return request('GET', '/announcements')
}

/** @returns {Promise<import('../types/models').Announcement>} */
export async function createAnnouncement({ title, body, pinned = false }) {
  if (USE_MOCK) {
    const db = getDb()
    const moderator = requireModerator(db)

    const errors = validateAnnouncement({ title, body })
    if (Object.keys(errors).length > 0) {
      throw fail('Please fix the highlighted fields', 400, errors)
    }

    const announcement = {
      id: `a${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      pinned: Boolean(pinned),
      authorId: moderator.id,
      createdAt: new Date().toISOString(),
    }
    db.announcements.push(announcement)
    saveDb(db)
    return delay(shapeAnnouncement(db, announcement))
  }
  return request('POST', '/announcements', { title: title.trim(), body: body.trim(), pinned })
}

/** @returns {Promise<import('../types/models').Announcement>} */
export async function setAnnouncementPinned(id, pinned) {
  if (USE_MOCK) {
    const db = getDb()
    requireModerator(db)

    const announcement = db.announcements.find((a) => a.id === id)
    if (!announcement) throw fail('Announcement not found', 404)

    announcement.pinned = Boolean(pinned)
    saveDb(db)
    return delay(shapeAnnouncement(db, announcement))
  }
  return request('PUT', `/announcements/${id}`, { pinned })
}

export async function deleteAnnouncement(id) {
  if (USE_MOCK) {
    const db = getDb()
    requireModerator(db)

    const announcement = db.announcements.find((a) => a.id === id)
    if (!announcement) throw fail('Announcement not found', 404)

    db.announcements = db.announcements.filter((a) => a.id !== id)
    saveDb(db)
    return delay(null)
  }
  return request('DELETE', `/announcements/${id}`)
}