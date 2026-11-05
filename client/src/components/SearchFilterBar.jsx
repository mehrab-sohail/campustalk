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
    <form className="card card-body mb-4" onSubmit={handleSubmit}>
      <div className="row g-2">
        <div className="col-12 col-md-5">
          <input
            type="search"
            className="form-control"
            placeholder="Search by title or keyword"
            aria-label="Search posts"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
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

        <div className="col-6 col-md-2">
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

        <div className="col-12 col-md-2 d-flex gap-2">
          <button type="submit" className="btn btn-primary flex-fill">Search</button>
          <button type="button" className="btn btn-outline-primary" onClick={handleReset}>Reset</button>
        </div>
      </div>
    </form>
  )
}

export default SearchFilterBar