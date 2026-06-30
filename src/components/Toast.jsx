'use client'

import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

// ─── Context ────────────────────────────────────────────────────────────────
const ToastContext = createContext(null)

let globalToast = null

export function useToast() {
  const ctx = useContext(ToastContext)
  if (ctx) return ctx
  return globalToast ?? { success: () => {}, error: () => {}, info: () => {}, warn: () => {} }
}

// ─── Icons & palette ─────────────────────────────────────────────────────────
const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warn: AlertTriangle,
}

const PALETTE = {
  success: { bar: 'bg-emerald-500', icon: 'text-emerald-500', bg: 'bg-white border-emerald-100' },
  error:   { bar: 'bg-red-500',     icon: 'text-red-500',     bg: 'bg-white border-red-100'     },
  info:    { bar: 'bg-brand',       icon: 'text-brand',       bg: 'bg-white border-brand/20'    },
  warn:    { bar: 'bg-amber-500',   icon: 'text-amber-500',   bg: 'bg-white border-amber-100'   },
}

// ─── Single toast item ───────────────────────────────────────────────────────
function ToastItem({ id, type = 'info', title, message, onRemove }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timerRef = useRef(null)

  const Icon = ICONS[type] ?? Info
  const palette = PALETTE[type] ?? PALETTE.info

  const dismiss = useCallback(() => {
    setLeaving(true)
    setTimeout(() => onRemove(id), 300)
  }, [id, onRemove])

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 16)
    timerRef.current = setTimeout(dismiss, 4500)
    return () => {
      clearTimeout(show)
      clearTimeout(timerRef.current)
    }
  }, [dismiss])

  const active = visible && !leaving

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        transition: 'opacity 0.28s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.95)',
      }}
      className={`relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border shadow-[0_8px_30px_rgba(0,0,0,0.10)] px-4 py-3.5 pointer-events-auto ${palette.bg}`}
    >
      {/* Left color accent bar */}
      <span className={`absolute left-0 inset-y-0 w-1 rounded-l-2xl ${palette.bar}`} />

      <Icon className={`mt-0.5 shrink-0 w-4 h-4 ${palette.icon}`} />

      <div className="flex-1 min-w-0">
        {title && <p className="text-[13px] font-semibold text-ink leading-tight">{title}</p>}
        {message && <p className="text-[11px] text-ink-2 mt-0.5 leading-relaxed">{message}</p>}
      </div>

      <button
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="shrink-0 mt-0.5 p-0.5 rounded-md text-ink-3 hover:text-ink transition-colors hover:bg-slate/40"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── Provider ─────────────────────────────────────────────────────────────────
let _toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, title, message) => {
    const id = ++_toastId
    setToasts((prev) => [...prev, { id, type, title, message }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const api = {
    success: (title, message) => addToast('success', title, message),
    error:   (title, message) => addToast('error',   title, message),
    info:    (title, message) => addToast('info',    title, message),
    warn:    (title, message) => addToast('warn',    title, message),
  }

  // Expose globally so non-context components can call toast.success() etc.
  globalToast = api

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast viewport — fixed bottom-right corner */}
      <div
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 w-80 pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            id={t.id}
            type={t.type}
            title={t.title}
            message={t.message}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
