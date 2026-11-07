import { useState } from 'react'
import { Link } from 'react-router-dom'
import StateWrapper from '../components/StateWrapper.jsx'
import useFetch from '../hooks/useFetch.js'
import { getNotifications, markNotificationRead } from '../services/api.js'

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function NotificationsPage() {
  const { data, loading, error, reload } = useFetch(() => getNotifications(), [])
  // Notifications the person marked as read on this page, so the list updates right away.
  const [readIds, setReadIds] = useState([])
  const [actionError, setActionError] = useState('')

  const isUnread = (notification) => !notification.read && !readIds.includes(notification.id)
  const unreadCount = data ? data.filter(isUnread).length : 0

  async function handleMarkRead(id) {
    setActionError('')
    try {
      await markNotificationRead(id)
      setReadIds((previous) => [...previous, id])
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <h2 className="mb-1">Notifications</h2>
        {data && <p className="text-muted">{unreadCount} unread</p>}

        {actionError && <div className="alert alert-danger">{actionError}</div>}

        <StateWrapper
          loading={loading}
          error={error}
          isEmpty={!data || data.length === 0}
          emptyMessage="No notifications yet."
          onRetry={reload}
        >
          {data &&
            data.map((notification) => {
              const unread = isUnread(notification)
              return (
                <div key={notification.id} className={`notification mb-3${unread ? ' unread' : ''}`}>
                  <div className="d-flex justify-content-between flex-wrap gap-1">
                    <span>
                      {unread && <span className="badge rounded-pill text-bg-primary me-2">New</span>}
                      {notification.message}
                    </span>
                    <small className="text-muted">{formatDateTime(notification.createdAt)}</small>
                  </div>

                  <div className="d-flex gap-2 mt-2">
                    <Link to={`/posts/${notification.postId}`} className="btn btn-outline-primary btn-sm">
                      View post
                    </Link>
                    {unread && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleMarkRead(notification.id)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
        </StateWrapper>
      </div>
    </div>
  )
}

export default NotificationsPage