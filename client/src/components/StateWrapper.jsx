// Shows loading, error, empty or the real content, in that order.
function StateWrapper({ loading, error, isEmpty, emptyMessage = 'Nothing to show yet.', onRetry, children }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 mb-0">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex justify-content-between align-items-center">
        <span>{error}</span>
        {onRetry && (
          <button className="btn btn-sm btn-outline-danger" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    )
  }

  if (isEmpty) {
    return <div className="text-center text-muted py-5">{emptyMessage}</div>
  }

  return children
}

export default StateWrapper