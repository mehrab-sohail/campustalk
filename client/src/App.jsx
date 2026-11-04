import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import FeedPage from './pages/FeedPage.jsx'
import PostDetailPage from './pages/PostDetailPage.jsx'
import PostEditorPage from './pages/PostEditorPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import MyActivityPage from './pages/MyActivityPage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'
import ModeratorPage from './pages/ModeratorPage.jsx'

function App() {
  return (
    <>
      <Navbar />
      <main className="container pb-5">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Pages for any logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<FeedPage />} />
            <Route path="/posts/new" element={<PostEditorPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/posts/:id/edit" element={<PostEditorPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/activity" element={<MyActivityPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Moderator only */}
          <Route element={<ProtectedRoute role="moderator" />}>
            <Route path="/moderator" element={<ModeratorPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}

export default App