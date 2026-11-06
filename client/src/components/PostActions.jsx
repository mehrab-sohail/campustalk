import { useState } from 'react'
import { setReaction, removeReaction, addBookmark, removeBookmark } from '../services/api.js'

// Like, Dislike and Bookmark buttons for one post.
function PostActions({ post }) {
  const [likes, setLikes] = useState(post.likes)
  const [dislikes, setDislikes] = useState(post.dislikes)
  const [myReaction, setMyReaction] = useState(post.myReaction)
  const [bookmarked, setBookmarked] = useState(post.bookmarked)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Clicking the reaction you already chose takes it back.
  async function handleReaction(type) {
    setBusy(true)
    setError('')
    try {
      const result = myReaction === type ? await removeReaction(post.id) : await setReaction(post.id, type)
      setLikes(result.likes)
      setDislikes(result.dislikes)
      setMyReaction(result.myReaction)
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  async function handleBookmark() {
    setBusy(true)
    setError('')
    try {
      const result = bookmarked ? await removeBookmark(post.id) : await addBookmark(post.id)
      setBookmarked(result.bookmarked)
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  return (
    <div>
      <div className="d-flex flex-wrap gap-2">
        <button
          type="button"
          className={`btn btn-sm ${myReaction === 'like' ? 'btn-primary' : 'btn-outline-primary'}`}
          disabled={busy}
          onClick={() => handleReaction('like')}
        >
          Like ({likes})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${myReaction === 'dislike' ? 'btn-danger' : 'btn-outline-danger'}`}
          disabled={busy}
          onClick={() => handleReaction('dislike')}
        >
          Dislike ({dislikes})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${bookmarked ? 'btn-warning' : 'btn-outline-warning'}`}
          disabled={busy}
          onClick={handleBookmark}
        >
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
      </div>
      {error && <div className="text-danger small mt-2">{error}</div>}
    </div>
  )
}

export default PostActions