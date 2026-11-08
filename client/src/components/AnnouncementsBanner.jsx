import useFetch from '../hooks/useFetch.js'
import { getAnnouncements } from '../services/api.js'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// The announcements box on the feed. Pinned ones come first, and at most 3 are shown.
function AnnouncementsBanner() {
  const { data } = useFetch(() => getAnnouncements(), [])

  // Announcements are an extra on the feed: while they load, or if they fail, show nothing.
  if (!data || data.length === 0) return null

  return (
    <section className="mb-4" aria-label="Announcements">
      <h5 className="mb-3">Announcements</h5>
      {data.slice(0, 3).map((announcement) => (
        <div key={announcement.id} className={`announcement mb-3${announcement.pinned ? ' pinned' : ''}`}>
          <div className="d-flex justify-content-between flex-wrap gap-1 mb-1">
            <strong className="announcement-title">{announcement.title}</strong>
            {announcement.pinned && <span className="badge rounded-pill text-bg-warning">Pinned</span>}
          </div>
          <p className="announcement-text mb-1">{announcement.body}</p>
          <small className="text-muted">
            By {announcement.author.name}, {formatDate(announcement.createdAt)}
          </small>
        </div>
      ))}
    </section>
  )
}

export default AnnouncementsBanner