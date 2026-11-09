import { useState } from 'react'
import { Link } from 'react-router-dom'
import StateWrapper from './StateWrapper.jsx'
import useFetch from '../hooks/useFetch.js'
import { getReports, hideReport, resolveReport } from '../services/api.js'

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// The "Reports" tab of the moderator page.
function ReportsPanel() {
  const [status, setStatus] = useState('open')
  const { data, loading, error, reload } = useFetch(() => getReports(status), [status])

  // Reports the moderator just dealt with, so the open list updates right away.
  const [doneIds, setDoneIds] = useState([])
  const [busyId, setBusyId] = useState('')
  const [actionError, setActionError] = useState('')

  async function handleAction(id, action) {
    setBusyId(id)
    setActionError('')
    try {
      await action(id)
      setDoneIds((previous) => [...previous, id])
    } catch (err) {
      setActionError(err.message)
    }
    setBusyId('')
  }

  const visible = data ? (status === 'open' ? data.filter((r) => !doneIds.includes(r.id)) : data) : []

  return (
    <>
      <div className="btn-group btn-group-sm mb-3" role="group" aria-label="Report status">
        <button
          type="button"
          className={`btn ${status === 'open' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setStatus('open')}
        >
          Open
        </button>
        <button
          type="button"
          className={`btn ${status === 'resolved' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setStatus('resolved')}
        >
          Resolved
        </button>
      </div>

      {actionError && <div className="alert alert-danger">{actionError}</div>}

      <StateWrapper
        loading={loading}
        error={error}
        isEmpty={visible.length === 0}
        emptyMessage={status === 'open' ? 'No open reports. Everything is clean.' : 'No resolved reports yet.'}
        onRetry={reload}
      >
        {visible.map((report) => (
          <div key={report.id} className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between flex-wrap gap-1 mb-2">
                <span>
                  <span className="badge rounded-pill text-bg-primary me-2">
                    {report.targetType === 'post' ? 'Post' : 'Comment'}
                  </span>
                  {report.targetHidden && <span className="badge rounded-pill text-bg-secondary">Hidden</span>}
                </span>
                <small className="text-muted">
                  Reported by {report.reporter.name} on {formatDateTime(report.createdAt)}
                </small>
              </div>

              <p className="mb-2">
                <strong>Reason:</strong> {report.reason}
              </p>
              <p className="report-preview mb-3">{report.targetPreview}</p>

              <div className="d-flex flex-wrap align-items-center gap-2">
                {!report.targetHidden && (
                  <Link to={`/posts/${report.postId}`} className="btn btn-outline-primary btn-sm">
                    View post
                  </Link>
                )}

                {report.status === 'open' ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={busyId === report.id}
                      onClick={() => handleAction(report.id, hideReport)}
                    >
                      Hide and resolve
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      disabled={busyId === report.id}
                      onClick={() => handleAction(report.id, resolveReport)}
                    >
                      Resolve without hiding
                    </button>
                  </>
                ) : (
                  <span className="badge rounded-pill text-bg-success">Resolved</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </StateWrapper>
    </>
  )
}

export default ReportsPanel