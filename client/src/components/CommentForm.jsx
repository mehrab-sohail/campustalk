import { useState } from 'react'
import { validateCommentBody } from '../utils/postValidators.js'

// The box under a post where a person writes a new comment.
function CommentForm({ onSubmit }) {
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const problem = validateCommentBody(body)
    if (problem) {
      setError(problem)
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await onSubmit(body.trim())
      setBody('')
    } catch (err) {
      setError(err.fieldErrors?.body || err.message)
    }
    setSubmitting(false)
  }

  return (
    <form className="card card-body mb-4" onSubmit={handleSubmit} noValidate>
      <label htmlFor="comment-body" className="form-label fw-semibold">Add a comment</label>
      <textarea
        id="comment-body"
        rows="3"
        className={`form-control${error ? ' is-invalid' : ''}`}
        placeholder="Write your comment here"
        value={body}
        onChange={(event) => {
          setBody(event.target.value)
          setError('')
        }}
      />
      <div className="invalid-feedback">{error}</div>
      <div className="d-flex justify-content-between align-items-center mt-2">
        <small className="text-muted">{body.length}/1000</small>
        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post comment'}
        </button>
      </div>
    </form>
  )
}

export default CommentForm