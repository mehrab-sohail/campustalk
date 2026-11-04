// A labelled input with an error message underneath. Every form uses it.
function FormField({ label, name, type = 'text', as = 'input', rows = 4, value, onChange, error, ...rest }) {
  const inputClass = `form-control${error ? ' is-invalid' : ''}`

  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">{label}</label>
      {as === 'textarea' ? (
        <textarea id={name} name={name} className={inputClass} rows={rows} value={value} onChange={onChange} {...rest} />
      ) : (
        <input id={name} name={name} type={type} className={inputClass} value={value} onChange={onChange} {...rest} />
      )}
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  )
}

export default FormField