import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../features/auth/authSlice.js'

function Navbar() {
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const closeMenu = () => setOpen(false)
  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active fw-bold' : ''}`

  function handleLogout() {
    dispatch(logoutUser())
    closeMenu()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-primary mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={closeMenu}>
          CampusTalk
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse${open ? ' show' : ''}`}>
          <ul className="navbar-nav me-auto">
            {user && (
              <>
                <li className="nav-item">
                  <NavLink end to="/" className={linkClass} onClick={closeMenu}>Feed</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/posts/new" className={linkClass} onClick={closeMenu}>New post</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/activity" className={linkClass} onClick={closeMenu}>My activity</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/notifications" className={linkClass} onClick={closeMenu}>Notifications</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/profile" className={linkClass} onClick={closeMenu}>Profile</NavLink>
                </li>
                {user.role === 'moderator' && (
                  <li className="nav-item">
                    <NavLink to="/moderator" className={linkClass} onClick={closeMenu}>Moderator</NavLink>
                  </li>
                )}
              </>
            )}
          </ul>

          <ul className="navbar-nav align-items-md-center">
            {user ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text me-md-3">{user.name}</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-light btn-sm" onClick={handleLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className={linkClass} onClick={closeMenu}>Login</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/signup" className={linkClass} onClick={closeMenu}>Sign up</NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar