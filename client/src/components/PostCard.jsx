import { Link } from 'react-router-dom'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Gives every category the same color every time (one of 4 brand colors).
function categoryColorIndex(categoryId) {
  let sum = 0
  for (const letter of categoryId) sum += letter.charCodeAt(0)
  return sum % 4
}

function PostCard({ post }) {
  const preview = post.body.length > 160 ? `${post.body.slice(0, 160)}...` : post.body

  return (
    <div className={`card post-card mb-3 cat-${categoryColorIndex(post.category.id)}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="badge cat-badge">{post.category.name}</span>
          <small className="text-muted">{formatDate(post.createdAt)}</small>
        </div>

        <h5 className="card-title">
          <Link to={`/posts/${post.id}`} className="text-decoration-none">
            {post.title}
          </Link>
        </h5>

        <p className="card-text">{preview}</p>

        <div className="d-flex flex-wrap gap-3 text-muted small">
          <span>By {post.author.name}</span>
          <span>{post.likes} likes</span>
          <span>{post.dislikes} dislikes</span>
          <span>{post.commentCount} comments</span>
        </div>
      </div>
    </div>
  )
}

export default PostCard