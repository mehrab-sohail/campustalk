import { useEffect, useState } from 'react'

// Runs an API function and returns { data, loading, error, reload }.
// "deps" are the values that should trigger a new request when they change.
function useFetch(fetchFunction, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    // "cancelled" stops an old request from overwriting a newer one.
    let cancelled = false
    setLoading(true)
    setError('')

    fetchFunction()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [...deps, reloadCount])

  const reload = () => setReloadCount((count) => count + 1)

  return { data, loading, error, reload }
}

export default useFetch