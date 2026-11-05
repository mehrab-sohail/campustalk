// Previous / page numbers / Next. Shows nothing when there is only one page.
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav aria-label="Feed pages">
      <ul className="pagination justify-content-center">
        <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
          <button type="button" className="page-link" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </button>
        </li>

        {pages.map((number) => (
          <li key={number} className={`page-item${number === page ? ' active' : ''}`}>
            <button type="button" className="page-link" onClick={() => onPageChange(number)}>
              {number}
            </button>
          </li>
        ))}

        <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
          <button type="button" className="page-link" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Pagination