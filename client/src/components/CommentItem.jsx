import { useState } from 'react'
import { validateCommentBody } from '../utils/postValidators.js'

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// One comment. The person who wrote it can edit or delete it.
function CommentItem({ comment, currentUserId, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(comment.body)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const isOwner = comment.author.id === currentUserId
  const isEdited = new Date(comment.updatedAt) - new Date(comment.createdAt) > 1000

  function startEditing() {
    setText(comment.body)
    setError('')
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setError('')
  }

  async function handleSave() {
    const problem = validateCommentBody(text)
    if (problem) {
      setError(problem)
      return
    }
    setBusy(true)
    setError('')
    try {
      await onUpdate(comment.id, text.trim())
      setEditing(false)
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  async function handleDelete() {
    setBusy(true)
    setError('')
    try {
      await onDelete(comment.id)
    } catch (err) {
      setError(err.message)
      setConfirmingDelete(false)
      setBusy(false)
    }
  }

  return (
    <div className="comment mb-3">
      <div className="d-flex justify-content-between flex-wrap gap-1 mb-1">
        <strong>{comment.author.name}</strong>
        <small className="text-muted">
          {formatDateTime(comment.createdAt)}
          {isEdited && ' (edited)'}
        </small>
      </div>

      {editing ? (
        <>
          <textarea
            rows="3"
            className={`form-control${error ? ' is-invalid' : ''}`}
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              setError('')
            }}
          />
          <div className="invalid-feedback">{error}</div>
          <div className="d-flex gap-2 mt-2">
            <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={handleSave}>
              {busy ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={cancelEditing}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="comment-text mb-2">{comment.body}</p>
          {error && <div className="text-danger small mb-2">{error}</div>}

          {isOwner &&
            (confirmingDelete ? (
              <div className="d-flex flex-wrap align-items-center gap-2 small">
                <span>Delete this comment?</span>
                <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={handleDelete}>
                  Yes, delete
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Keep it
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={startEditing}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setConfirmingDelete(true)}
                >
                  Delete
                </button>
              </div>
            ))}
        </>
      )}
    </div>
  )
}

export default CommentItem