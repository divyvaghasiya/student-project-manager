import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { daysUntil, dueLabel, initials } from '../store'

// Full class names so Tailwind can detect them at build time.
export const COLOR_CLASSES = {
  indigo: { dot: 'bg-indigo-500', bar: 'bg-gradient-to-r from-indigo-500 to-indigo-400', soft: 'bg-indigo-50 text-indigo-700', ring: 'ring-indigo-500', border: 'border-t-indigo-500' },
  emerald: { dot: 'bg-emerald-500', bar: 'bg-gradient-to-r from-emerald-500 to-emerald-400', soft: 'bg-emerald-50 text-emerald-700', ring: 'ring-emerald-500', border: 'border-t-emerald-500' },
  amber: { dot: 'bg-amber-500', bar: 'bg-gradient-to-r from-amber-500 to-amber-400', soft: 'bg-amber-50 text-amber-700', ring: 'ring-amber-500', border: 'border-t-amber-500' },
  rose: { dot: 'bg-rose-500', bar: 'bg-gradient-to-r from-rose-500 to-rose-400', soft: 'bg-rose-50 text-rose-700', ring: 'ring-rose-500', border: 'border-t-rose-500' },
  sky: { dot: 'bg-sky-500', bar: 'bg-gradient-to-r from-sky-500 to-sky-400', soft: 'bg-sky-50 text-sky-700', ring: 'ring-sky-500', border: 'border-t-sky-500' },
  violet: { dot: 'bg-violet-500', bar: 'bg-gradient-to-r from-violet-500 to-violet-400', soft: 'bg-violet-50 text-violet-700', ring: 'ring-violet-500', border: 'border-t-violet-500' },
}

const AVATAR_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500', 'bg-violet-500', 'bg-teal-500', 'bg-fuchsia-500']
const avatarColor = (name) => AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]

/* ---------- Icons (inline SVG, no extra dependency) ---------- */
const paths = {
  plus: 'M12 5v14M5 12h14',
  x: 'M6 6l12 12M18 6L6 18',
  trash: 'M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4h6v3',
  pencil: 'M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4',
  home: 'M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10',
  check: 'M5 12l5 5L20 7',
  checkCircle: 'M9 12l2 2 4-4M12 21a9 9 0 110-18 9 9 0 010 18z',
  users: 'M16 19v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1M9 10a3 3 0 100-6 3 3 0 000 6zM22 19v-1a4 4 0 00-3-3.9M16 4.1a3 3 0 010 5.8',
  userPlus: 'M15 19v-1a4 4 0 00-4-4H5a4 4 0 00-4 4v1M8 10a3 3 0 100-6 3 3 0 000 6zM19 8v6M16 11h6',
  calendar: 'M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
  folder: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  clipboard: 'M9 4h6v3H9zM7 5H6a1 1 0 00-1 1v14a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1h-1M9 12h6M9 16h4',
  alert: 'M12 9v4M12 17h.01M10.3 3.9L2 18a2 2 0 001.7 3h16.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  undo: 'M9 14L4 9l5-5M4 9h11a5 5 0 010 10h-3',
  chevronLeft: 'M15 18l-6-6 6-6',
  chevronRight: 'M9 18l6-6-6-6',
  refresh: 'M4 4v6h6M20 20v-6h-6M5 15a7 7 0 0012 3M19 9A7 7 0 007 6',
}

export function Icon({ name, className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}

/* ---------- Small display pieces ---------- */
const PRIORITY_CLASSES = {
  low: 'bg-slate-100 text-slate-600 ring-slate-200',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  high: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${PRIORITY_CLASSES[priority]}`}>
      {priority}
    </span>
  )
}

export function DueBadge({ date, done }) {
  if (!date) return null
  const n = daysUntil(date)
  const cls = done
    ? 'text-slate-400'
    : n < 0
      ? 'text-rose-600 font-semibold'
      : n <= 2
        ? 'text-amber-600 font-semibold'
        : 'text-slate-500'
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${cls}`}>
      <Icon name="calendar" className="h-3.5 w-3.5" />
      {done ? date : dueLabel(date)}
    </span>
  )
}

export function Avatar({ name, size = 'sm' }) {
  const s = { xs: 'h-5 w-5 text-[9px]', sm: 'h-7 w-7 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-11 w-11 text-sm' }[size]
  return (
    <span title={name} className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white ${avatarColor(name)} ${s}`}>
      {initials(name)}
    </span>
  )
}

export function AvatarStack({ people, max = 4 }) {
  return (
    <div className="flex -space-x-2">
      {people.slice(0, max).map((p) => <Avatar key={p.id} name={p.name} size="sm" />)}
      {people.length > max && (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600 ring-2 ring-white">
          +{people.length - max}
        </span>
      )}
    </div>
  )
}

export function ProgressBar({ value, color = 'indigo' }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full transition-all duration-500 ${COLOR_CLASSES[color].bar}`} style={{ width: `${value}%` }} />
    </div>
  )
}

export function EmptyState({ icon = 'folder', title, children }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 px-6 py-10 text-center">
      <span className="mb-3 rounded-full bg-indigo-50 p-3 text-indigo-500"><Icon name={icon} className="h-6 w-6" /></span>
      <p className="font-semibold text-slate-700">{title}</p>
      <div className="mt-1 text-sm text-slate-500">{children}</div>
    </div>
  )
}

/* ---------- Buttons & form fields ---------- */
export const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100'

const btnBase = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50'
export const btnPrimary = `${btnBase} bg-indigo-600 text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 focus-visible:ring-indigo-200`
export const btnSecondary = `${btnBase} border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-200`
export const btnDanger = `${btnBase} bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-200`
export const btnDangerGhost = `${btnBase} border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 focus-visible:ring-rose-100`

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  )
}

/* ---------- Modal ---------- */
export function Modal({ title, subtitle, onClose, children, size = 'md' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${size === 'sm' ? 'max-w-sm' : 'max-w-md'} rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ---------- Confirm dialog (replaces window.confirm, which embedded browsers can block) ---------- */
const ConfirmContext = createContext(() => {})

export function ConfirmProvider({ children }) {
  const [req, setReq] = useState(null)
  const confirm = useCallback((opts) => setReq(opts), [])
  const close = () => setReq(null)
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {req && (
        <Modal title={req.title} onClose={close} size="sm">
          <div className="flex gap-3">
            <span className="h-fit rounded-full bg-rose-50 p-2 text-rose-600"><Icon name="alert" className="h-5 w-5" /></span>
            <p className="text-sm text-slate-600">{req.message}</p>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={close} className={btnSecondary}>Cancel</button>
            <button
              autoFocus
              onClick={() => { req.onConfirm(); close() }}
              className={btnDanger}
            >
              {req.confirmLabel ?? 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  )
}

export const useConfirm = () => useContext(ConfirmContext)
