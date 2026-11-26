import { createContext, useCallback, useContext, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { daysUntil, dueLabel, initials } from '@/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Full class names so Tailwind can detect them at build time.
export const PROJECT_COLORS = {
  indigo: { dot: 'bg-indigo-500', indicator: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', soft: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300', ring: 'ring-indigo-500', glow: 'from-indigo-500/15' },
  emerald: { dot: 'bg-emerald-500', indicator: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', soft: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-500', glow: 'from-emerald-500/15' },
  amber: { dot: 'bg-amber-500', indicator: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', soft: 'bg-amber-500/10 text-amber-700 dark:text-amber-300', ring: 'ring-amber-500', glow: 'from-amber-500/15' },
  rose: { dot: 'bg-rose-500', indicator: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', soft: 'bg-rose-500/10 text-rose-700 dark:text-rose-300', ring: 'ring-rose-500', glow: 'from-rose-500/15' },
  sky: { dot: 'bg-sky-500', indicator: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400', soft: 'bg-sky-500/10 text-sky-700 dark:text-sky-300', ring: 'ring-sky-500', glow: 'from-sky-500/15' },
  violet: { dot: 'bg-violet-500', indicator: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-400', soft: 'bg-violet-500/10 text-violet-700 dark:text-violet-300', ring: 'ring-violet-500', glow: 'from-violet-500/15' },
}
export const projectColor = (c) => PROJECT_COLORS[c] ?? PROJECT_COLORS.indigo

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-200',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-200',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/25 dark:text-amber-200',
  'bg-rose-100 text-rose-700 dark:bg-rose-500/25 dark:text-rose-200',
  'bg-sky-100 text-sky-700 dark:bg-sky-500/25 dark:text-sky-200',
  'bg-violet-100 text-violet-700 dark:bg-violet-500/25 dark:text-violet-200',
  'bg-teal-100 text-teal-700 dark:bg-teal-500/25 dark:text-teal-200',
  'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/25 dark:text-fuchsia-200',
]
const avatarColor = (name) => AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]

const AVATAR_SIZES = {
  xs: { box: 'size-5', text: 'text-[9px]' },
  sm: { box: 'size-7', text: 'text-[10px]' },
  md: { box: 'size-9', text: 'text-xs' },
  lg: { box: 'size-11', text: 'text-sm' },
}

export function StudentAvatar({ name, size = 'sm', className, tooltip = false }) {
  const avatar = (
    <Avatar className={cn(AVATAR_SIZES[size].box, className)}>
      <AvatarFallback className={cn('font-semibold tracking-tight', AVATAR_SIZES[size].text, avatarColor(name))}>{initials(name)}</AvatarFallback>
    </Avatar>
  )
  if (!tooltip) return avatar
  return (
    <Tooltip>
      <TooltipTrigger asChild><span className="inline-flex">{avatar}</span></TooltipTrigger>
      <TooltipContent>{name}</TooltipContent>
    </Tooltip>
  )
}

export function AvatarStack({ people, max = 4, size = 'sm' }) {
  return (
    <div className="flex -space-x-2">
      {people.slice(0, max).map((p) => (
        <StudentAvatar key={p.id} name={p.name} size={size} tooltip className="ring-2 ring-background" />
      ))}
      {people.length > max && (
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground ring-2 ring-background">
          +{people.length - max}
        </span>
      )}
    </div>
  )
}

const PRIORITY = {
  low: { label: 'Low', dot: 'bg-zinc-400' },
  medium: { label: 'Medium', dot: 'bg-amber-500' },
  high: { label: 'High', dot: 'bg-rose-500' },
}

export function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] ?? PRIORITY.medium
  return (
    <Badge variant="outline" className="gap-1.5 px-2 font-medium text-muted-foreground">
      <span className={cn('size-1.5 rounded-full', p.dot)} />
      {p.label}
    </Badge>
  )
}

export function DueBadge({ date, done, className }) {
  if (!date) return null
  const n = daysUntil(date)
  const tone = done
    ? 'text-muted-foreground'
    : n < 0
      ? 'text-rose-600 dark:text-rose-400 font-medium'
      : n <= 2
        ? 'text-amber-600 dark:text-amber-400 font-medium'
        : 'text-muted-foreground'
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs', tone, className)}>
      <CalendarDays className="size-3.5" />
      {done ? new Date(date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : dueLabel(date)}
    </span>
  )
}

export function EmptyState({ icon: IconCmp, title, description, children, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center', className)}>
      {IconCmp && (
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl border bg-background shadow-sm">
          <IconCmp className="size-5 text-muted-foreground" />
        </div>
      )}
      <p className="font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

/* Confirm dialog built on shadcn AlertDialog. Usage: const confirm = useConfirm(); confirm({ title, message, confirmLabel, onConfirm }) */
const ConfirmContext = createContext(() => {})

export function ConfirmProvider({ children }) {
  const [req, setReq] = useState(null)
  const confirm = useCallback((opts) => setReq(opts), [])
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={!!req} onOpenChange={(o) => !o && setReq(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{req?.title}</AlertDialogTitle>
            <AlertDialogDescription>{req?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30"
              onClick={() => req?.onConfirm()}
            >
              {req?.confirmLabel ?? 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

export const useConfirm = () => useContext(ConfirmContext)
