'use client'

import { forwardRef, useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'

const ICONS = { mail: Mail, user: User, lock: Lock }

/**
 * NOTE: The exported, JSX-resolvable identifiers are the *wrapped* components
 * (forwarded at the bottom of the file). Naming the inner functions the same
 * way as the JSX means React gets the plain function-component element, tries
 * to attach a ref to it, and throws "Cannot add property current, object is
 * not extensible" — JSX elements produced from a function component are
 * frozen by the React JSX runtime.
 */

function TextFieldInner(
  {
    label,
    type = 'text',
    icon,
    trailingSlot,
    error,
    hint,
    className = '',
    inputClassName = '',
    id,
    ...props
  },
  ref
) {
  const generatedId =
    id || `field-${props.name || Math.random().toString(36).slice(2, 8)}`

  // Resolve the icon: support either a key into our ICONS map, or a component
  // passed directly.
  const LeadingIcon = typeof icon === 'string' ? ICONS[icon] : icon

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={generatedId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div
        className={`relative flex items-center bg-white border rounded-xl transition-colors ${
          error
            ? 'border-red-400 focus-within:border-red-500'
            : 'border-border focus-within:border-brand'
        }`}
      >
        {LeadingIcon && (
          <span className="absolute left-3 text-ink-3 pointer-events-none">
            <LeadingIcon className="w-4 h-4" />
          </span>
        )}
        <input
          id={generatedId}
          ref={ref}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${generatedId}-msg` : undefined}
          className={`w-full bg-transparent text-sm text-ink placeholder:text-ink-3/70 px-3.5 py-2.5 outline-none ${
            LeadingIcon ? 'pl-10' : ''
          } ${trailingSlot ? 'pr-11' : ''} ${inputClassName}`}
          {...props}
        />
        {trailingSlot && (
          <span className="absolute right-2 flex items-center">{trailingSlot}</span>
        )}
      </div>
      {(error || hint) && (
        <p
          id={`${generatedId}-msg`}
          className={`text-xs ${error ? 'text-red-600' : 'text-ink-3'}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
}

function PasswordFieldInner(
  { label = 'Password', type, icon, error, hint, className = '', ...props },
  ref
) {
  const [revealed, setRevealed] = useState(false)

  const Toggle = (
    <button
      type="button"
      onClick={() => setRevealed((r) => !r)}
      className="w-8 h-8 rounded-md flex items-center justify-center text-ink-3 hover:text-ink hover:bg-slate transition-colors"
      aria-label={revealed ? 'Hide password' : 'Show password'}
      aria-pressed={revealed}
      tabIndex={-1}
    >
      {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  )

  return (
    <TextField
      ref={ref}
      label={label}
      type={revealed ? 'text' : 'password'}
      icon={icon || 'lock'}
      trailingSlot={Toggle}
      error={error}
      hint={hint}
      className={className}
      {...props}
    />
  )
}

const TextField = forwardRef(TextFieldInner)
TextField.displayName = 'TextField'

const PasswordField = forwardRef(PasswordFieldInner)
PasswordField.displayName = 'PasswordField'

export { TextField, PasswordField }
export default TextField
