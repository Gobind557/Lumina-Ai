import type { ReactNode } from 'react'

export const uiTokens = {
  // Prospects uses the same "glass on light gradient" language as Dashboard.
  card: 'rgba(255,255,255,0.70)',
  panel: 'rgba(255,255,255,0.70)',
  border: 'rgba(226,232,240,0.70)', // slate-200/70
  primary: '#7c3aed',
} as const

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function Surface({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cx('rounded-2xl border shadow-sm backdrop-blur-xl', className)}
      style={{
        background: uiTokens.card,
        borderColor: uiTokens.border,
      }}
    >
      {children}
    </div>
  )
}

export function Panel({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cx('rounded-2xl border backdrop-blur-xl', className)}
      style={{
        background: uiTokens.panel,
        borderColor: uiTokens.border,
      }}
    >
      {children}
    </div>
  )
}

export function TextInput(props: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: 'text' | 'email' | 'search'
  autoComplete?: string
  leftIcon?: ReactNode
  inputRef?: React.Ref<HTMLInputElement>
}) {
  const { leftIcon, inputRef, ...rest } = props
  return (
    <div className="relative">
      {leftIcon ? (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {leftIcon}
        </div>
      ) : null}
      <input
        ref={inputRef}
        value={rest.value}
        onChange={(e) => rest.onChange(e.target.value)}
        placeholder={rest.placeholder}
        type={rest.type ?? 'text'}
        autoComplete={rest.autoComplete ?? 'off'}
        className={cx(
          'w-full rounded-xl border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
          'bg-white/80 border-slate-200/70',
          'focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed]/40',
          leftIcon ? 'pl-9' : '',
        )}
      />
    </div>
  )
}

export function Button(props: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
}) {
  const variant = props.variant ?? 'secondary'
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const styles =
    variant === 'primary'
      ? 'text-white bg-[#7c3aed] hover:bg-[#6d28d9] shadow-sm shadow-violet-500/20'
      : variant === 'ghost'
        ? 'text-slate-600 hover:text-slate-900 hover:bg-white'
        : 'text-slate-800 bg-white/70 hover:bg-white border border-slate-200/70'

  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={props.disabled}
      className={cx(base, styles, props.className)}
    >
      {props.children}
    </button>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cx('animate-pulse rounded-md bg-slate-200/60', className)}
    />
  )
}

