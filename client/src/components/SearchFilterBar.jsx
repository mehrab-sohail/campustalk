import { useState } from 'react'

// Search box, category dropdown and sort dropdown for the feed.
function SearchFilterBar({ search, categoryId, sort, categories, onSearch, onCategoryChange, onSortChange, onReset }) {
  const [text, setText] = useState(search)

  function handleSubmit(event) {
    event.preventDefault()
    onSearch(text.trim())
  }

  function handleReset() {
    setText('')
    onReset()
  }

  return (
    <form className="card card-body mb-4 search-bar" onSubmit={handleSubmit}>
      <div className="row g-2">
        <div className="col-12 col-md-6">
          <div className="input-group">
            <input
              type="search"
              className="form-control"
              placeholder="Search by title or keyword"
              aria-label="Search posts"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <select
            className="form-select"
            aria-label="Filter by category"
            value={categoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-6 col-md-3">
          <select
            className="form-select"
            aria-label="Sort posts"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="liked">Most liked</option>
          </select>
        </div>
      </div>

      <div className="mt-2">
        <button type="button" className="btn btn-link btn-sm p-0 reset-link" onClick={handleReset}>
          Reset search and filters
        </button>
      </div>
    </form>
  )
}

export default SearchFilterBar