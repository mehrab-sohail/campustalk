import { Link } from 'react-router-dom'
import PostCard from '../components/PostCard.jsx'
import StateWrapper from '../components/StateWrapper.jsx'
import useFetch from '../hooks/useFetch.js'
import { getPosts } from '../services/api.js'

function FeedPage() {
  const { data, loading, error, reload } = useFetch(
    () => getPosts({ page: 1, pageSize: 10 }),
    []
  )

  return (
    <div>
      <div className="hero mb-4">
        <h2 className="mb-2">Campus discussions, all in one place</h2>
        <p className="mb-3">
          Ask questions, share ideas and find out what is happening around university.
        </p>
        <Link to="/posts/new" className="btn btn-light">Start a discussion</Link>
      </div>

      <h4 className="mb-3">Latest posts</h4>

      <StateWrapper
        loading={loading}
        error={error}
        isEmpty={!data || data.items.length === 0}
        emptyMessage="No posts yet. Be the first to start a discussion."
        onRetry={reload}
      >
        {data && data.items.map((post) => <PostCard key={post.id} post={post} />)}
      </StateWrapper>
    </div>
  )
}

export default FeedPage