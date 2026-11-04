import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import FormField from '../components/FormField.jsx'
import { login } from '../services/api.js'
import { loginUser } from '../features/auth/authSlice.js'
import { validateEmail, validatePassword } from '../utils/validators.js'

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError('')

    const newErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    }
    setErrors(newErrors)
    if (newErrors.email || newErrors.password) return

    setLoading(true)
    try {
      const result = await login(form)
      dispatch(loginUser(result))
      navigate('/')
    } catch (error) {
      const fieldErrors = error.fieldErrors || {}
      setErrors(fieldErrors)
      if (Object.keys(fieldErrors).length === 0) setServerError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <h2 className="mb-4">Log in</h2>

        {serverError && <div className="alert alert-danger">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
          <FormField label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-3">
          New here? <Link to="/signup">Create an account</Link>
        </p>
        <p className="text-muted small">
          Sample accounts: ali@campustalk.test / Student123 and moderator@campustalk.test / Moderator123
        </p>
      </div>
    </div>
  )
}

export default LoginPage