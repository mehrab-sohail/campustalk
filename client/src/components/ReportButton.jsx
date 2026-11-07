import { useState } from 'react'
import ReportModal from './ReportModal.jsx'

// A small "Report" button that opens the pop-up. After sending, it shows a thank-you.
function ReportButton({ targetType, targetId }) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)

  if (sent) {
    return <span className="text-muted small">Reported, thank you</span>
  }

  return (
    <>
      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setOpen(true)}>
        Report
      </button>
      {open && (
        <ReportModal
          targetType={targetType}
          targetId={targetId}
          onClose={() => setOpen(false)}
          onSent={() => {
            setOpen(false)
            setSent(true)
          }}
        />
      )}
    </>
  )
}

export default ReportButton