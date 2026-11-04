import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import FormField from '../components/FormField.jsx'
import { getProfile, updateProfile } from '../services/api.js'
import { updateUser } from '../features/auth/authSlice.js'
import { validateName, validateBio } from '../utils/validators.js'

function ProfilePage() {
  const dispatch = useDispatch()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ name: '', bio: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [serverError, setServerError] = useState('')

  // Load the profile once, when the page opens.
  useEffect(() => {
    getProfile()
      .then((user) => {
        setProfile(user)
        setForm({ name: user.name, bio: user.bio || '' })
      })
      .catch((error) => setLoadError(error.message))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setServerError('')

    const newErrors = {
      name: validateName(form.name),
      bio: validateBio(form.bio),
    }
    setErrors(newErrors)
    if (newErrors.name || newErrors.bio) return

    setSaving(true)
    try {
      const updated = await updateProfile(form)
      setProfile(updated)
      dispatch(updateUser(updated))
      setMessage('Profile saved')
    } catch (error) {
      const fieldErrors = error.fieldErrors || {}
      setErrors(fieldErrors)
      if (Object.keys(fieldErrors).length === 0) setServerError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading profile...</p>
      </div>
    )
  }

  if (loadError) {
    return <div className="alert alert-danger">{loadError}</div>
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <h2 className="mb-4">My profile</h2>

        <p className="mb-1"><strong>Email:</strong> {profile.email}</p>
        <p className="mb-4">
          <strong>Role:</strong> <span className="badge bg-secondary">{profile.role}</span>
        </p>

        {message && <div className="alert alert-success">{message}</div>}
        {serverError && <div className="alert alert-danger">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
          <FormField label="Bio" name="bio" as="textarea" rows={3} value={form.bio} onChange={handleChange} error={errors.bio} />
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage