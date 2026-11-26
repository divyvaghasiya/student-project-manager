import { STATUSES } from '../store'
import { COLOR_CLASSES, DueBadge, PriorityBadge } from './ui'

const byDate = (a, b) => (a.dueDate || '9').localeCompare(b.dueDate || '9')

export default function MyWork({ student, projects, dispatch, onOpen }) {
  const mine = projects.filter((p) => p.memberIds.includes(student.id))
  const tasks = mine.flatMap((p) => p.tasks.filter((t) => t.assigneeId === student.id).map((t) => ({ ...t, project: p })))
  const resp = mine
    .flatMap((p) => p.responsibilities.filter((r) => r.studentId === student.id).map((r) => ({ ...r, project: p })))
    .sort(byDate)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My work</h1>
        <p className="text-sm text-slate-500">
          {student.name}'s tasks and responsibilities across {mine.length} project{mine.length === 1 ? '' : 's'}.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Responsibilities</h2>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {resp.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-4 py-3">
              <input
                type="checkbox"
                checked={r.done}
                onChange={() => dispatch({ type: 'updateResponsibility', projectId: r.project.id, id: r.id, patch: { done: !r.done } })}
                className="accent-indigo-600"
                aria-label={`Mark "${r.title}" done`}
              />
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-medium ${r.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{r.title}</p>
                <button onClick={() => onOpen(r.project.id)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:underline">
                  <span className={`h-1.5 w-1.5 rounded-full ${COLOR_CLASSES[r.project.color].dot}`} />
                  {r.project.name}
                </button>
              </div>
              <DueBadge date={r.dueDate} done={r.done} />
            </li>
          ))}
          {!resp.length && <li className="px-4 py-6 text-center text-sm text-slate-400">No responsibilities assigned yet.</li>}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">My tasks</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {STATUSES.map((col, i) => {
            const items = tasks.filter((t) => t.status === col.id).sort(byDate)
            return (
              <div key={col.id} className="rounded-xl bg-slate-100/70 p-3">
                <h3 className="mb-3 px-1 text-sm font-semibold text-slate-700">
                  {col.label} <span className="ml-1 rounded-full bg-white px-2 text-xs font-medium text-slate-500">{items.length}</span>
                </h3>
                <ul className="space-y-2">
                  {items.map((t) => (
                    <li key={t.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                      <p className={`text-sm font-medium ${t.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.title}</p>
                      <button onClick={() => onOpen(t.project.id)} className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 hover:underline">
                        <span className={`h-1.5 w-1.5 rounded-full ${COLOR_CLASSES[t.project.color].dot}`} />
                        {t.project.name}
                      </button>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={t.priority} />
                          <DueBadge date={t.dueDate} done={t.status === 'done'} />
                        </div>
                        <div className="flex gap-1">
                          {i > 0 && (
                            <button onClick={() => dispatch({ type: 'updateTask', projectId: t.project.id, taskId: t.id, patch: { status: STATUSES[i - 1].id } })} className="rounded border border-slate-200 px-2 py-0.5 text-[11px] text-slate-500 hover:bg-slate-50" aria-label={`Move to ${STATUSES[i - 1].label}`}>←</button>
                          )}
                          {i < STATUSES.length - 1 && (
                            <button onClick={() => dispatch({ type: 'updateTask', projectId: t.project.id, taskId: t.id, patch: { status: STATUSES[i + 1].id } })} className="rounded border border-slate-200 px-2 py-0.5 text-[11px] text-slate-500 hover:bg-slate-50" aria-label={`Move to ${STATUSES[i + 1].label}`}>→</button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                  {!items.length && <li className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">Nothing here</li>}
                </ul>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
