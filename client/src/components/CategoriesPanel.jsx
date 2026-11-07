import { useState } from 'react'
import StateWrapper from './StateWrapper.jsx'
import useFetch from '../hooks/useFetch.js'
import { validateCategoryName } from '../utils/postValidators.js'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api.js'

// One category with its Rename, Archive and Delete buttons.
function CategoryRow({ category, onRename, onToggleArchive, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  async function run(action) {
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (err) {
      setError(err.fieldErrors?.name || err.message)
      setConfirmingDelete(false)
    }
    setBusy(false)
  }

  function handleSaveName() {
    const problem = validateCategoryName(name)
    if (problem) {
      setError(problem)
      return
    }
    run(async () => {
      await onRename(category.id, name.trim())
      setEditing(false)
    })
  }

  function startEditing() {
    setName(category.name)
    setError('')
    setEditing(true)
  }

  return (
    <div className="category-row mb-2">
      <div className="d-flex flex-wrap align-items-center gap-2">
        {editing ? (
          <>
            <input
              type="text"
              className={`form-control form-control-sm w-auto${error ? ' is-invalid' : ''}`}
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setError('')
              }}
            />
            <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={handleSaveName}>
              Save
            </button>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <span className="fw-semibold">{category.name}</span>
            {category.archived && <span className="badge rounded-pill text-bg-secondary">Archived</span>}

            <div className="ms-auto d-flex flex-wrap gap-2">
              {confirmingDelete ? (
                <>
                  <span className="small align-self-center">Delete this category?</span>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={busy}
                    onClick={() => run(() => onDelete(category.id))}
                  >
                    Yes, delete
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Keep it
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={startEditing}>
                    Rename
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    disabled={busy}
                    onClick={() => run(() => onToggleArchive(category.id, !category.archived))}
                  >
                    {category.archived ? 'Restore' : 'Archive'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      setError('')
                      setConfirmingDelete(true)
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  )
}

// The "Categories" tab of the moderator page.
function CategoriesPanel() {
  const { data, loading, error, reload } = useFetch(() => getCategories(true), [])

  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)

  async function handleAdd(event) {
    event.preventDefault()
    const problem = validateCategoryName(newName)
    if (problem) {
      setAddError(problem)
      return
    }

    setAdding(true)
    setAddError('')
    try {
      await createCategory({ name: newName })
      setNewName('')
      reload()
    } catch (err) {
      setAddError(err.fieldErrors?.name || err.message)
    }
    setAdding(false)
  }

  async function handleRename(id, name) {
    await updateCategory(id, { name })
    reload()
  }

  async function handleToggleArchive(id, archived) {
    await updateCategory(id, { archived })
    reload()
  }

  async function handleDelete(id) {
    await deleteCategory(id)
    reload()
  }

  return (
    <>
      <form className="card card-body mb-3" onSubmit={handleAdd} noValidate>
        <label htmlFor="new-category" className="form-label fw-semibold">Add a category</label>
        <div className="input-group">
          <input
            id="new-category"
            type="text"
            className={`form-control${addError ? ' is-invalid' : ''}`}
            placeholder="For example: Sports"
            value={newName}
            onChange={(event) => {
              setNewName(event.target.value)
              setAddError('')
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={adding}>
            {adding ? 'Adding...' : 'Add category'}
          </button>
        </div>
        {addError && <div className="text-danger small mt-1">{addError}</div>}
      </form>

      <p className="text-muted small">
        A category that has posts cannot be deleted. Archive it instead: it disappears from the new post form and the
        feed filter, and old posts keep it.
      </p>

      <StateWrapper
        loading={loading}
        error={error}
        isEmpty={!data || data.length === 0}
        emptyMessage="No categories yet."
        onRetry={reload}
      >
        {data &&
          data.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onRename={handleRename}
              onToggleArchive={handleToggleArchive}
              onDelete={handleDelete}
            />
          ))}
      </StateWrapper>
    </>
  )
}

export default CategoriesPanel