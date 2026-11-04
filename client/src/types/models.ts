// Main data models for CampusTalk. They match docs/API_CONTRACT.md.

export type Role = 'student' | 'moderator'
export type ReactionType = 'like' | 'dislike'

export interface PersonRef {
  id: string
  name: string
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  bio: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  archived: boolean
}

export interface Post {
  id: string
  title: string
  body: string
  category: { id: string; name: string }
  author: PersonRef
  createdAt: string
  updatedAt: string
  likes: number
  dislikes: number
  commentCount: number
  myReaction: ReactionType | null
  bookmarked: boolean
}

export interface Comment {
  id: string
  postId: string
  postTitle?: string
  body: string
  author: PersonRef
  createdAt: string
  updatedAt: string
}

export interface Reaction {
  id: string
  postId: string
  userId: string
  type: ReactionType
}

export interface Report {
  id: string
  targetType: 'post' | 'comment'
  targetId: string
  postId: string
  targetPreview: string
  targetHidden: boolean
  reason: string
  status: 'open' | 'resolved'
  reporter: PersonRef
  createdAt: string
}

export interface Notification {
  id: string
  type: 'comment' | 'moderation'
  message: string
  postId: string
  read: boolean
  createdAt: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  pinned: boolean
  author: PersonRef
  createdAt: string
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface AuthResult {
  user: User
  token: string
}