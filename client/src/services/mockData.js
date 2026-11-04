// Fictional sample data. It is only used when VITE_USE_MOCK=true.
// The mock "database" is saved in Local Storage, so changes survive a refresh.

const DB_KEY = 'campustalk_mock_db'

const daysAgo = (days) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

const seedUsers = [
  { id: 'u0', name: 'Campus Moderator', email: 'moderator@campustalk.test', password: 'Moderator123', role: 'moderator', bio: 'Keeping CampusTalk friendly.', createdAt: daysAgo(60) },
  { id: 'u1', name: 'Ali Khan', email: 'ali@campustalk.test', password: 'Student123', role: 'student', bio: 'CS, 5th semester', createdAt: daysAgo(50) },
  { id: 'u2', name: 'Sara Ahmed', email: 'sara@campustalk.test', password: 'Student123', role: 'student', bio: 'Software Engineering, 3rd semester', createdAt: daysAgo(45) },
  { id: 'u3', name: 'Hamza Raza', email: 'hamza@campustalk.test', password: 'Student123', role: 'student', bio: 'Data Science, 7th semester', createdAt: daysAgo(40) },
]

const seedCategories = [
  { id: 'c1', name: 'Academics', archived: false },
  { id: 'c2', name: 'Events', archived: false },
  { id: 'c3', name: 'Campus Life', archived: false },
  { id: 'c4', name: 'Old Clubs', archived: true },
]

const titles = [
  'Best way to prepare for the web exam?',
  'Anyone has notes for Data Structures?',
  'Which elective should I take next semester?',
  'Tips for surviving the first week of semester',
  'Annual tech fest registration is open',
  'Cricket tournament: teams needed',
  'Where can I find a quiet place to study?',
  'Cafeteria timings during exams',
  'Looking for a team for the final year project',
  'Is the library open on weekends?',
  'Best societies to join as a freshman',
  'How do I apply for a transcript?',
  'Photography club meetup this Friday',
]

const seedPosts = Array.from({ length: 26 }, (_, i) => ({
  id: `p${i + 1}`,
  title: i < titles.length ? titles[i] : `${titles[i - titles.length]} (part 2)`,
  body: 'Sample post text for testing the feed. Share your thoughts in the comments.',
  categoryId: seedCategories[i % 3].id,
  authorId: seedUsers[(i % 3) + 1].id,
  hidden: false,
  createdAt: daysAgo(i % 14),
  updatedAt: daysAgo(i % 14),
}))

// Varied like and dislike counts so "most liked" and "top posts" have a clear order.
const seedReactions = []
seedPosts.forEach((post, index) => {
  const likeCount = (index * 7) % 9
  const dislikeCount = (index * 3) % 4
  for (let k = 0; k < likeCount; k++) {
    seedReactions.push({ id: `${post.id}-like-${k}`, postId: post.id, userId: `fan-${post.id}-${k}`, type: 'like' })
  }
  for (let k = 0; k < dislikeCount; k++) {
    seedReactions.push({ id: `${post.id}-dislike-${k}`, postId: post.id, userId: `critic-${post.id}-${k}`, type: 'dislike' })
  }
})

const emptyDb = {
  users: [],
  categories: [],
  posts: [],
  comments: [],
  reactions: [],
  bookmarks: [],
  reports: [],
  notifications: [],
  announcements: [],
}

function createSeedDb() {
  return {
    ...emptyDb,
    users: seedUsers,
    categories: seedCategories,
    posts: seedPosts,
    reactions: seedReactions,
  }
}

export function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

export function getDb() {
  try {
    const saved = localStorage.getItem(DB_KEY)
    if (saved) return { ...emptyDb, ...JSON.parse(saved) }
  } catch {
    // The saved copy is broken, so a fresh one is created below.
  }
  const db = createSeedDb()
  saveDb(db)
  return db
}

// Deletes the saved copy, so the next call to getDb() starts from the sample data again.
export function resetDb() {
  localStorage.removeItem(DB_KEY)
}