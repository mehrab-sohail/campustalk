import { useState } from 'react'
import { createReport } from '../services/api.js'
import { validateReportReason } from '../utils/postValidators.js'

// A pop-up where a person writes why they are reporting a post or a comment.
function ReportModal({ targetType, targetId, onClose, onSent }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const problem = validateReportReason(reason)
    if (problem) {
      setError(problem)
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await createReport({ targetType, targetId, reason })
      onSent()
    } catch (err) {
      setError(err.fieldErrors?.reason || err.message)
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <form className="modal-content" onSubmit={handleSubmit} noValidate>
            <div className="modal-header">
              <h5 className="modal-title" id="report-title">Report this {targetType}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <p className="text-muted small">Tell the moderator what is wrong. They will review it.</p>
              <textarea
                rows="4"
                className={`form-control${error ? ' is-invalid' : ''}`}
                placeholder="Reason for the report"
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value)
                  setError('')
                }}
              />
              <div className="invalid-feedback">{error}</div>
              <div className="form-text text-end">{reason.length}/300</div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-primary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default ReportModal