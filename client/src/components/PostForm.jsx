import { useState } from 'react'
import { Link } from 'react-router-dom'
import { validatePost } from '../utils/postValidators.js'

// The form used by both "new post" and "edit post".
function PostForm({ initialValues, categories, submitting, serverErrors, submitLabel, cancelTo, onSubmit }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  // Problems found here win over problems sent back by the server.
  const shown = { ...serverErrors, ...errors }

  function handleChange(event) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const found = validatePost(values)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }
    setErrors({})
    onSubmit({
      title: values.title.trim(),
      body: values.body.trim(),
      categoryId: values.categoryId,
    })
  }

  return (
    <form className="card card-body" onSubmit={handleSubmit} noValidate>
      <div className="mb-3">
        <label htmlFor="title" className="form-label">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          className={`form-control${shown.title ? ' is-invalid' : ''}`}
          value={values.title}
          onChange={handleChange}
          placeholder="What do you want to talk about?"
        />
        <div className="invalid-feedback">{shown.title}</div>
        <div className="form-text text-end">{values.title.length}/120</div>
      </div>

      <div className="mb-3">
        <label htmlFor="categoryId" className="form-label">Category</label>
        <select
          id="categoryId"
          name="categoryId"
          className={`form-select${shown.categoryId ? ' is-invalid' : ''}`}
          value={values.categoryId}
          onChange={handleChange}
        >
          <option value="">Choose a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <div className="invalid-feedback">{shown.categoryId}</div>
      </div>

      <div className="mb-3">
        <label htmlFor="body" className="form-label">Post text</label>
        <textarea
          id="body"
          name="body"
          rows="8"
          className={`form-control${shown.body ? ' is-invalid' : ''}`}
          value={values.body}
          onChange={handleChange}
          placeholder="Write your question or idea here"
        />
        <div className="invalid-feedback">{shown.body}</div>
        <div className="form-text text-end">{values.body.length}/5000</div>
      </div>

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
        <Link to={cancelTo} className="btn btn-outline-primary">Cancel</Link>
      </div>
    </form>
  )
}

export default PostForm