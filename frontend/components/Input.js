export default function Input({ label, className = '', ...props }) {
  return (
    <div>
      {label && <label className="form-label">{label}</label>}
      <input className={`form-input ${className}`} {...props} />
    </div>
  )
}