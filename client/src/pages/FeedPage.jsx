import { useState } from 'react'
import { Link } from 'react-router-dom'
import PostCard from '../components/PostCard.jsx'
import StateWrapper from '../components/StateWrapper.jsx'
import SearchFilterBar from '../components/SearchFilterBar.jsx'
import Pagination from '../components/Pagination.jsx'
import TopPostsSidebar from '../components/TopPostsSidebar.jsx'
import useFetch from '../hooks/useFetch.js'
import { getPosts, getCategories } from '../services/api.js'

function FeedPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState('newest')

  const { data: categories } = useFetch(() => getCategories(), [])
  const { data, loading, error, reload } = useFetch(
    () => getPosts({ page, pageSize: 10, search, categoryId, sort }),
    [page, search, categoryId, sort]
  )

  // Every filter change goes back to page 1, so the person never lands on an empty page.
  function handleSearch(value) {
    setSearch(value)
    setPage(1)
  }

  function handleCategoryChange(value) {
    setCategoryId(value)
    setPage(1)
  }

  function handleSortChange(value) {
    setSort(value)
    setPage(1)
  }

  function handleReset() {
    setSearch('')
    setCategoryId('')
    setSort('newest')
    setPage(1)
  }

  function handlePageChange(newPage) {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isFiltered = search !== '' || categoryId !== ''

  return (
    <div>
      <div className="hero mb-4">
        <h2 className="mb-2">Campus discussions, all in one place</h2>
        <p className="mb-3">
          Ask questions, share ideas and find out what is happening around university.
        </p>
        <Link to="/posts/new" className="btn btn-light">Start a discussion</Link>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <SearchFilterBar
            search={search}
            categoryId={categoryId}
            sort={sort}
            categories={categories || []}
            onSearch={handleSearch}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onReset={handleReset}
          />

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">{isFiltered ? 'Search results' : 'All posts'}</h4>
            {data && <small className="text-muted">{data.total} posts</small>}
          </div>

          <StateWrapper
            loading={loading}
            error={error}
            isEmpty={!data || data.items.length === 0}
            emptyMessage={
              isFiltered
                ? 'No posts match your search. Try different words or another category.'
                : 'No posts yet. Be the first to start a discussion.'
            }
            onRetry={reload}
          >
            {data && (
              <>
                {data.items.map((post) => <PostCard key={post.id} post={post} />)}
                <Pagination page={data.page} totalPages={data.totalPages} onPageChange={handlePageChange} />
              </>
            )}
          </StateWrapper>
        </div>

        <div className="col-lg-4 mt-4 mt-lg-0">
          <TopPostsSidebar />
        </div>
      </div>
    </div>
  )
}

export default FeedPage