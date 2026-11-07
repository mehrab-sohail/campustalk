import { useState } from 'react'
import { Link } from 'react-router-dom'
import PostCard from '../components/PostCard.jsx'
import StateWrapper from '../components/StateWrapper.jsx'
import useFetch from '../hooks/useFetch.js'
import { getMyPosts, getMyComments, getMyBookmarks, removeBookmark } from '../services/api.js'

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Tab 1: the posts this person wrote.
function MyPosts() {
  const { data, loading, error, reload } = useFetch(() => getMyPosts(), [])

  return (
    <StateWrapper
      loading={loading}
      error={error}
      isEmpty={!data || data.length === 0}
      emptyMessage="You have not written any posts yet."
      onRetry={reload}
    >
      {data && data.map((post) => <PostCard key={post.id} post={post} />)}
    </StateWrapper>
  )
}

// Tab 2: the comments this person wrote, with a link to the post each one is on.
function MyComments() {
  const { data, loading, error, reload } = useFetch(() => getMyComments(), [])

  return (
    <StateWrapper
      loading={loading}
      error={error}
      isEmpty={!data || data.length === 0}
      emptyMessage="You have not written any comments yet."
      onRetry={reload}
    >
      {data &&
        data.map((comment) => (
          <div key={comment.id} className="comment mb-3">
            <p className="comment-text mb-2">{comment.body}</p>
            <div className="d-flex justify-content-between flex-wrap gap-1 small text-muted">
              <span>
                On <Link to={`/posts/${comment.postId}`}>{comment.postTitle}</Link>
              </span>
              <span>{formatDateTime(comment.createdAt)}</span>
            </div>
          </div>
        ))}
    </StateWrapper>
  )
}

// Tab 3: the posts this person saved. A bookmark can be removed here.
function MyBookmarks() {
  const { data, loading, error, reload } = useFetch(() => getMyBookmarks(), [])
  const [removedIds, setRemovedIds] = useState([])
  const [actionError, setActionError] = useState('')

  async function handleRemove(postId) {
    setActionError('')
    try {
      await removeBookmark(postId)
      setRemovedIds((previous) => [...previous, postId])
    } catch (err) {
      setActionError(err.message)
    }
  }

  const visible = data ? data.filter((post) => !removedIds.includes(post.id)) : []

  return (
    <>
      {actionError && <div className="alert alert-danger">{actionError}</div>}
      <StateWrapper
        loading={loading}
        error={error}
        isEmpty={visible.length === 0}
        emptyMessage="No bookmarks yet. Open a post and click Bookmark to save it."
        onRetry={reload}
      >
        {visible.map((post) => (
          <div key={post.id} className="mb-4">
            <PostCard post={post} />
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => handleRemove(post.id)}
            >
              Remove bookmark
            </button>
          </div>
        ))}
      </StateWrapper>
    </>
  )
}

const TABS = [
  { id: 'posts', label: 'My posts' },
  { id: 'comments', label: 'My comments' },
  { id: 'bookmarks', label: 'Bookmarks' },
]

function MyActivityPage() {
  const [tab, setTab] = useState('posts')

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <h2 className="mb-3">My activity</h2>

        <ul className="nav nav-pills mb-4">
          {TABS.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                type="button"
                className={`nav-link${tab === item.id ? ' active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {tab === 'posts' && <MyPosts />}
        {tab === 'comments' && <MyComments />}
        {tab === 'bookmarks' && <MyBookmarks />}
      </div>
    </div>
  )
}

export default MyActivityPage