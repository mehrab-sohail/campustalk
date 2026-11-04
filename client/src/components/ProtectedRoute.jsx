import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Guards pages that need a login. Pass role="moderator" for moderator-only pages.
function ProtectedRoute({ role }) {
  const user = useSelector((state) => state.auth.user)

  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />

  return <Outlet />
}

export default ProtectedRoute