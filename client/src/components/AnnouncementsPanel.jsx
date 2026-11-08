import { useState } from 'react'
import StateWrapper from './StateWrapper.jsx'
import useFetch from '../hooks/useFetch.js'
import { validateAnnouncement } from '../utils/postValidators.js'
import {
  getAnnouncements,
  createAnnouncement,
  setAnnouncementPinned,
  deleteAnnouncement,
} from '../services/api.js'

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// One announcement in the moderator's list, with Pin and Delete buttons.
function AnnouncementRow({ announcement, onTogglePin, onDelete }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  async function run(action) {
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (err) {
      setError(err.message)
      setConfirmingDelete(false)
    }
    setBusy(false)
  }

  return (
    <div className={`announcement mb-3${announcement.pinned ? ' pinned' : ''}`}>
      <div className="d-flex justify-content-between flex-wrap gap-1 mb-1">
        <strong className="announcement-title">{announcement.title}</strong>
        {announcement.pinned && <span className="badge rounded-pill text-bg-warning">Pinned</span>}
      </div>
      <p className="announcement-text mb-2">{announcement.body}</p>
      <small className="text-muted d-block mb-2">
        By {announcement.author.name}, {formatDateTime(announcement.createdAt)}
      </small>

      <div className="d-flex flex-wrap align-items-center gap-2">
        {confirmingDelete ? (
          <>
            <span className="small">Delete this announcement?</span>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              disabled={busy}
              onClick={() => run(() => onDelete(announcement.id))}
            >
              Yes, delete
            </button>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setConfirmingDelete(false)}>
              Keep it
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              disabled={busy}
              onClick={() => run(() => onTogglePin(announcement.id, !announcement.pinned))}
            >
              {announcement.pinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => setConfirmingDelete(true)}
            >
              Delete
            </button>
          </>
        )}
      </div>
      {error && <div className="text-danger small mt-2">{error}</div>}
    </div>
  )
}

// The "Announcements" tab of the moderator page.
function AnnouncementsPanel() {
  const { data, loading, error, reload } = useFetch(() => getAnnouncements(), [])

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const found = validateAnnouncement({ title, body })
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }

    setSubmitting(true)
    setErrors({})
    setFormError('')
    try {
      await createAnnouncement({ title, body, pinned })
      setTitle('')
      setBody('')
      setPinned(false)
      reload()
    } catch (err) {
      setErrors(err.fieldErrors || {})
      setFormError(err.message)
    }
    setSubmitting(false)
  }

  async function handleTogglePin(id, shouldPin) {
    await setAnnouncementPinned(id, shouldPin)
    reload()
  }

  async function handleDelete(id) {
    await deleteAnnouncement(id)
    reload()
  }

  return (
    <>
      <form className="card card-body mb-4" onSubmit={handleSubmit} noValidate>
        <h5 className="mb-3">New announcement</h5>

        <div className="mb-3">
          <label htmlFor="announcement-title" className="form-label">Title</label>
          <input
            id="announcement-title"
            type="text"
            className={`form-control${errors.title ? ' is-invalid' : ''}`}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value)
              setErrors((previous) => ({ ...previous, title: '' }))
            }}
          />
          <div className="invalid-feedback">{errors.title}</div>
        </div>

        <div className="mb-3">
          <label htmlFor="announcement-body" className="form-label">Text</label>
          <textarea
            id="announcement-body"
            rows="4"
            className={`form-control${errors.body ? ' is-invalid' : ''}`}
            value={body}
            onChange={(event) => {
              setBody(event.target.value)
              setErrors((previous) => ({ ...previous, body: '' }))
            }}
          />
          <div className="invalid-feedback">{errors.body}</div>
          <div className="form-text text-end">{body.length}/2000</div>
        </div>

        <div className="form-check mb-3">
          <input
            id="announcement-pin"
            type="checkbox"
            className="form-check-input"
            checked={pinned}
            onChange={(event) => setPinned(event.target.checked)}
          />
          <label htmlFor="announcement-pin" className="form-check-label">
            Pin this announcement to the top of the feed
          </label>
        </div>

        {formError && !errors.title && !errors.body && <div className="alert alert-danger">{formError}</div>}

        <div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Publishing...' : 'Publish announcement'}
          </button>
        </div>
      </form>

      <StateWrapper
        loading={loading}
        error={error}
        isEmpty={!data || data.length === 0}
        emptyMessage="No announcements yet."
        onRetry={reload}
      >
        {data &&
          data.map((announcement) => (
            <AnnouncementRow
              key={announcement.id}
              announcement={announcement}
              onTogglePin={handleTogglePin}
              onDelete={handleDelete}
            />
          ))}
      </StateWrapper>
    </>
  )
}

export default AnnouncementsPanel