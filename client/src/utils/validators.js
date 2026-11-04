const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Each function returns an error message, or '' when the value is fine.

export function validateName(value) {
  const name = value.trim()
  if (!name) return 'Name is required'
  if (name.length < 2 || name.length > 50) return 'Name must be 2 to 50 characters'
  return ''
}

export function validateEmail(value) {
  const email = value.trim()
  if (!email) return 'Email is required'
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address'
  return ''
}

export function validatePassword(value) {
  if (!value) return 'Password is required'
  if (value.length < 6) return 'Password must be at least 6 characters'
  return ''
}

// Used by the profile page (Step 6).
export function validateBio(value) {
  if (value.length > 300) return 'Bio must be 300 characters or less'
  return ''
}