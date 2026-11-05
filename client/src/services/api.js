import { getDb, saveDb } from './mockData.js'
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