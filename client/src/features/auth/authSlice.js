import { createSlice } from '@reduxjs/toolkit'
import { AUTH_STORAGE_KEY } from '../../services/api.js'

// Reads the saved login (if any), so a refresh keeps the user logged in.
function loadAuthFromStorage() {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY)
    return saved ? JSON.parse(saved) : { user: null, token: null }
  } catch {
    return { user: null, token: null }
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadAuthFromStorage(),
  reducers: {
    // Called after a successful login or signup. The payload is { user, token }.
    loginUser: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(action.payload))
    },
    // Called after a profile edit (Step 6), so the new name shows everywhere.
    updateUser: (state, action) => {
      state.user = action.payload
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: state.user, token: state.token })
      )
    },
    // Clears the login from Redux and from Local Storage.
    logoutUser: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem(AUTH_STORAGE_KEY)
    },
  },
})

export const { loginUser, updateUser, logoutUser } = authSlice.actions
export default authSlice.reducer