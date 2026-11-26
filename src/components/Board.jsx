import { useState } from 'react'
import { ChevronLeft, ChevronRight, Circle, CircleCheck, CircleDashed, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUSES } from '@/store'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DueBadge, PriorityBadge, StudentAvatar } from '@/components/shared'

const COLUMN = {
  todo: { icon: Circle, tone: 'text-muted-foreground' },
  doing: { icon: CircleDashed, tone: 'text-sky-500' },
  done: { icon: CircleCheck, tone: 'text-emerald-500' },
}

function MoveButton({ label, onClick, children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-6"
          aria-label={`Move to ${label}`}
          onClick={(e) => { e.stopPropagation(); onClick() }}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Move to {label}</TooltipContent>
    </Tooltip>
  )
}

export default function Board({ project, members, filter, onMove, onEdit, onAdd }) {
  const [dragOver, setDragOver] = useState(null)
  const [dragging, setDragging] = useState(null)
  const memberById = Object.fromEntries(members.map((m) => [m.id, m]))
  const tasks = project.tasks.filter((t) => filter === 'all' || (filter === 'unassigned' ? !t.assigneeId : t.assigneeId === filter))

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {STATUSES.map((col, i) => {
        const items = tasks.filter((t) => t.status === col.id)
        const { icon: ColIcon, tone } = COLUMN[col.id]
        return (
          <section
            key={col.id}
            onDragOver={(e) => { e.preventDefault(); setDragOver(col.id) }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(null)
              const id = e.dataTransfer.getData('text/plain')
              if (id) onMove(id, col.id)
            }}
            className={cn(
              'flex min-h-56 flex-col rounded-xl border bg-muted/50 p-2 transition-colors dark:bg-muted/20',
              dragOver === col.id && 'border-primary/40 bg-primary/5',
            )}
          >
            <header className="flex items-center justify-between px-2 py-1.5">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <ColIcon className={cn('size-4', tone)} />
                {col.label}
                <span className="text-xs font-normal text-muted-foreground tabular-nums">{items.length}</span>
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" onClick={() => onAdd(col.id)} aria-label={`Add task to ${col.label}`}>
                    <Plus />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add task</TooltipContent>
              </Tooltip>
            </header>

            <ul className="mt-1 flex flex-1 flex-col gap-2">
              {items.map((t) => {
                const assignee = memberById[t.assigneeId]
                return (
                  <li
                    key={t.id}
                    draggable
                    onDragStart={(e) => { e.dataTransfer.setData('text/plain', t.id); setDragging(t.id) }}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => onEdit(t)}
                    className={cn(
                      'group cursor-pointer rounded-lg border bg-card p-3 shadow-xs transition-all hover:border-foreground/20 hover:shadow-md',
                      dragging === t.id && 'rotate-1 opacity-60',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm leading-snug font-medium', t.status === 'done' && 'text-muted-foreground line-through')}>{t.title}</p>
                      {assignee ? (
                        <StudentAvatar name={assignee.name} size="xs" tooltip />
                      ) : (
                        <span className="shrink-0 rounded-full border border-dashed px-1.5 py-0.5 text-[10px] text-muted-foreground">Unassigned</span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={t.priority} />
                        <DueBadge date={t.dueDate} done={t.status === 'done'} />
                      </div>
                      <div className="flex gap-1 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                        {i > 0 && (
                          <MoveButton label={STATUSES[i - 1].label} onClick={() => onMove(t.id, STATUSES[i - 1].id)}>
                            <ChevronLeft className="size-3.5" />
                          </MoveButton>
                        )}
                        {i < STATUSES.length - 1 && (
                          <MoveButton label={STATUSES[i + 1].label} onClick={() => onMove(t.id, STATUSES[i + 1].id)}>
                            <ChevronRight className="size-3.5" />
                          </MoveButton>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
              {!items.length && (
                <li className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-6 text-xs text-muted-foreground">
                  Drop tasks here
                </li>
              )}
            </ul>

            <Button variant="ghost" size="sm" className="mt-2 justify-start text-muted-foreground" onClick={() => onAdd(col.id)}>
              <Plus /> Add task
            </Button>
          </section>
        )
      })}
    </div>
  )
}
