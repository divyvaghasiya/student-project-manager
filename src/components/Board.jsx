import { useState } from 'react'
import { STATUSES } from '../store'
import { Avatar, DueBadge, Icon, PriorityBadge } from './ui'

const COLUMN_STYLE = {
  todo: { dot: 'bg-slate-400', head: 'text-slate-700', bg: 'bg-slate-100/80' },
  doing: { dot: 'bg-sky-500', head: 'text-sky-800', bg: 'bg-sky-50/80' },
  done: { dot: 'bg-emerald-500', head: 'text-emerald-800', bg: 'bg-emerald-50/80' },
}

export default function Board({ project, members, filter, onMove, onEdit, onAdd }) {
  const [dragOver, setDragOver] = useState(null)
  const memberById = Object.fromEntries(members.map((m) => [m.id, m]))
  const tasks = project.tasks.filter((t) => filter === 'all' || (filter === 'unassigned' ? !t.assigneeId : t.assigneeId === filter))

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {STATUSES.map((col, i) => {
        const items = tasks.filter((t) => t.status === col.id)
        const style = COLUMN_STYLE[col.id]
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
            className={`flex min-h-52 flex-col rounded-2xl p-3 ring-2 transition ${style.bg} ${dragOver === col.id ? 'ring-indigo-400' : 'ring-transparent'}`}
          >
            <header className="mb-3 flex items-center justify-between px-1">
              <h3 className={`flex items-center gap-2 text-sm font-bold ${style.head}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                {col.label}
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 shadow-sm">{items.length}</span>
              </h3>
              <button onClick={() => onAdd(col.id)} className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm" aria-label={`Add task to ${col.label}`}>
                <Icon name="plus" />
              </button>
            </header>
            <ul className="flex flex-1 flex-col gap-2.5">
              {items.map((t) => {
                const assignee = memberById[t.assigneeId]
                return (
                  <li
                    key={t.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', t.id)}
                    onClick={() => onEdit(t)}
                    className="group cursor-pointer rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-snug ${t.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.title}</p>
                      {assignee ? <Avatar name={assignee.name} size="sm" /> : <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400">Unassigned</span>}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={t.priority} />
                        <DueBadge date={t.dueDate} done={t.status === 'done'} />
                      </div>
                      {/* Move buttons: keyboard/touch alternative to drag and drop */}
                      <div className="flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                        {i > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onMove(t.id, STATUSES[i - 1].id) }}
                            className="rounded-md border border-slate-200 p-1 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            aria-label={`Move to ${STATUSES[i - 1].label}`}
                            title={`Move to ${STATUSES[i - 1].label}`}
                          >
                            <Icon name="chevronLeft" className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {i < STATUSES.length - 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onMove(t.id, STATUSES[i + 1].id) }}
                            className="rounded-md border border-slate-200 p-1 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            aria-label={`Move to ${STATUSES[i + 1].label}`}
                            title={`Move to ${STATUSES[i + 1].label}`}
                          >
                            <Icon name="chevronRight" className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
              {!items.length && (
                <li className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-xs font-medium text-slate-400">
                  Drop tasks here
                </li>
              )}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
