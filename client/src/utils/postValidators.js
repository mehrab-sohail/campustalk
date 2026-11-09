// Each function returns an error message, or '' when the value is fine.
export function validateTitle(title) {
  const value = title.trim()
  if (!value) return 'Title is required'
  if (value.length > 120) return 'Title must be 120 characters or less'
  return ''
}

export function validatePostBody(body) {
  const value = body.trim()
  if (!value) return 'Post text is required'
  if (value.length > 5000) return 'Post text must be 5000 characters or less'
  return ''
}

export function validateCategory(categoryId) {
  if (!categoryId) return 'Please choose a category'
  return ''
}

// Returns an object with only the fields that have a problem, like { title: '...' }.
export function validatePost({ title, body, categoryId }) {
  const errors = {}
  const titleError = validateTitle(title)
  const bodyError = validatePostBody(body)
  const categoryError = validateCategory(categoryId)

  if (titleError) errors.title = titleError
  if (bodyError) errors.body = bodyError
  if (categoryError) errors.categoryId = categoryError
  return errors
}


export function validateCommentBody(body) {
  const value = body.trim()
  if (!value) return 'Comment text is required'
  if (value.length > 1000) return 'Comment must be 1000 characters or less'
  return ''
}

export function validateReportReason(reason) {
  const value = reason.trim()
  if (value.length < 3) return 'Please tell the moderator why (at least 3 characters)'
  if (value.length > 300) return 'Reason must be 300 characters or less'
  return ''
}

export function validateAnnouncementBody(body) {
  const value = body.trim()
  if (!value) return 'Announcement text is required'
  if (value.length > 2000) return 'Announcement text must be 2000 characters or less'
  return ''
}

// Returns an object with only the fields that have a problem, like { title: '...' }.
export function validateAnnouncement({ title, body }) {
  const errors = {}
  const titleError = validateTitle(title)
  const bodyError = validateAnnouncementBody(body)

  if (titleError) errors.title = titleError
  if (bodyError) errors.body = bodyError
  return errors
}

export function validateCategoryName(name) {
  const value = name.trim()
  if (value.length < 2) return 'Category name must be at least 2 characters'
  if (value.length > 40) return 'Category name must be 40 characters or less'
  return ''
}