import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import StateWrapper from '../components/StateWrapper.jsx'
import PostActions from '../components/PostActions.jsx'
import ReportButton from '../components/ReportButton.jsx'
import CommentForm from '../components/CommentForm.jsx'
import CommentItem from '../components/CommentItem.jsx'
import useFetch from '../hooks/useFetch.js'
import { getPost, getComments, addComment, updateComment, deleteComment } from '../services/api.js'

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function PostDetailPage() {
  const { id } = useParams()
  const user = useSelector((state) => state.auth.user)

  const { data: post, loading: postLoading, error: postError, reload: reloadPost } = useFetch(
    () => getPost(id),
    [id]
  )
  const {
    data: comments,
    loading: commentsLoading,
    error: commentsError,
    reload: reloadComments,
  } = useFetch(() => getComments(id), [id])

  async function handleAddComment(body) {
    await addComment(id, { body })
    reloadComments()
  }

  async function handleUpdateComment(commentId, body) {
    await updateComment(commentId, { body })
    reloadComments()
  }

  async function handleDeleteComment(commentId) {
    await deleteComment(commentId)
    reloadComments()
  }

  const isOwner = post && user && post.author.id === user.id
  const isEdited = post && new Date(post.updatedAt) - new Date(post.createdAt) > 1000

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <Link to="/" className="d-inline-block mb-3 text-decoration-none">
          &lsaquo; Back to the feed
        </Link>

        <StateWrapper loading={postLoading} error={postError} onRetry={reloadPost}>
          {post && (
            <>
              <article className="card mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-1 mb-2">
                    <span className="badge rounded-pill text-bg-primary">{post.category.name}</span>
                    <small className="text-muted">
                      {formatDateTime(post.createdAt)}
                      {isEdited && ' (edited)'}
                    </small>
                  </div>

                  <h2 className="mb-1">{post.title}</h2>
                  <p className="text-muted small mb-3">By {post.author.name}</p>

                  <p className="post-body">{post.body}</p>

                  <div className="d-flex flex-wrap align-items-center gap-3 border-top pt-3">
                    <PostActions key={post.id} post={post} />
                    <div className="ms-auto">
                      {isOwner ? (
                        <Link to={`/posts/${post.id}/edit`} className="btn btn-outline-primary btn-sm">
                          Edit post
                        </Link>
                      ) : (
                        <ReportButton targetType="post" targetId={post.id} />
                      )}
                    </div>
                  </div>
                </div>
              </article>

              <section>
                <h4 className="mb-3">Comments{comments ? ` (${comments.length})` : ''}</h4>

                <CommentForm onSubmit={handleAddComment} />

                <StateWrapper
                  loading={commentsLoading}
                  error={commentsError}
                  isEmpty={!comments || comments.length === 0}
                  emptyMessage="No comments yet. Be the first to comment."
                  onRetry={reloadComments}
                >
                  {comments &&
                    comments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        currentUserId={user.id}
                        onUpdate={handleUpdateComment}
                        onDelete={handleDeleteComment}
                      />
                    ))}
                </StateWrapper>
              </section>
            </>
          )}
        </StateWrapper>
      </div>
    </div>
  )
}

export default PostDetailPage