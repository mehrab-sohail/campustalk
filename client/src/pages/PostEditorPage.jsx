import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PostForm from '../components/PostForm.jsx'
import StateWrapper from '../components/StateWrapper.jsx'
import useFetch from '../hooks/useFetch.js'
import { getCategories, getPost, createPost, updatePost, deletePost } from '../services/api.js'

// One page for two jobs: /posts/new creates a post, /posts/:id/edit changes one.
function PostEditorPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const { data: categories } = useFetch(() => getCategories(), [])
  const { data: post, loading, error, reload } = useFetch(
    () => (isEdit ? getPost(id) : Promise.resolve(null)),
    [id]
  )

  async function handleSubmit(values) {
    setSubmitting(true)
    setFormError('')
    setFieldErrors({})
    try {
      if (isEdit) {
        await updatePost(id, values)
      } else {
        await createPost(values)
      }
      // The feed shows this message once, then clears it.
      navigate('/', {
        state: { message: isEdit ? 'Your post was updated.' : 'Your post was submitted successfully.' },
      })
    } catch (err) {
      setFormError(err.message)
      setFieldErrors(err.fieldErrors || {})
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    setSubmitting(true)
    setFormError('')
    try {
      await deletePost(id)
      navigate('/', { state: { message: 'Your post was deleted.' } })
    } catch (err) {
      setFormError(err.message)
      setSubmitting(false)
      setConfirmingDelete(false)
    }
  }

  const notOwner = isEdit && post && post.author.id !== user.id

  // The post's own category stays in the list, even if it was archived later.
  const options = [...(categories || [])]
  if (post && !options.some((category) => category.id === post.category.id)) {
    options.push(post.category)
  }

  const initialValues = post
    ? { title: post.title, body: post.body, categoryId: post.category.id }
    : { title: '', body: '', categoryId: '' }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <h2 className="mb-3">{isEdit ? 'Edit post' : 'Start a discussion'}</h2>

        <StateWrapper loading={loading} error={error} onRetry={reload}>
          {notOwner ? (
            <div className="alert alert-warning">
              You can only edit your own posts. <Link to="/">Back to the feed</Link>
            </div>
          ) : (
            <>
              {formError && <div className="alert alert-danger">{formError}</div>}

              <PostForm
                key={post ? post.id : 'new'}
                initialValues={initialValues}
                categories={options}
                submitting={submitting}
                serverErrors={fieldErrors}
                submitLabel={isEdit ? 'Save changes' : 'Create post'}
                cancelTo="/"
                onSubmit={handleSubmit}
              />

              {isEdit && (
                <div className="mt-4 pt-3 border-top">
                  {confirmingDelete ? (
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <span>Delete this post for good?</span>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={submitting}
                        onClick={handleDelete}
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
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => setConfirmingDelete(true)}
                    >
                      Delete post
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </StateWrapper>
      </div>
    </div>
  )
}

export default PostEditorPage