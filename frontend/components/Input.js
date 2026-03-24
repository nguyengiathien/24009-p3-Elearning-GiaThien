export default function Input({ label, className = '', ...props }) {
  return (
    <div>
      {label && <label className="mb-2 block text-sm font-medium text-slate-900">{label}</label>}
      <input className={`block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 ${className}`} {...props} />
    </div>
  )
}