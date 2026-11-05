import { useState } from 'react'
import { Link } from 'react-router-dom'
import StateWrapper from './StateWrapper.jsx'
import useFetch from '../hooks/useFetch.js'
import { getTopPosts } from '../services/api.js'

// "Top posts" box with a This week / All time switch.
function TopPostsSidebar() {
  const [range, setRange] = useState('week')

  const { data, loading, error, reload } = useFetch(
    () => getTopPosts({ range, limit: 5 }),
    [range]
  )

  return (
    <div className="card top-posts">
      <div className="card-body">
        <h5 className="card-title">Top posts</h5>

        <div className="btn-group btn-group-sm w-100 mb-3" role="group" aria-label="Top posts range">
          <button
            type="button"
            className={`btn ${range === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setRange('week')}
          >
            This week
          </button>
          <button
            type="button"
            className={`btn ${range === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setRange('all')}
          >
            All time
          </button>
        </div>

        <StateWrapper
          loading={loading}
          error={error}
          isEmpty={!data || data.length === 0}
          emptyMessage="No top posts yet."
          onRetry={reload}
        >
          <ol className="list-unstyled mb-0">
            {data &&
              data.map((post, index) => (
                <li key={post.id} className="top-post-item">
                  <span className="top-rank">{index + 1}</span>
                  <div>
                    <Link to={`/posts/${post.id}`} className="text-decoration-none fw-semibold">
                      {post.title}
                    </Link>
                    <div className="small text-muted">
                      {post.likes + post.dislikes} reactions, {post.likes} likes
                    </div>
                  </div>
                </li>
              ))}
          </ol>
        </StateWrapper>
      </div>
    </div>
  )
}

export default TopPostsSidebar