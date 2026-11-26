import { useState } from 'react'
import { uid } from '../store'
import AddMemberModal from './AddMemberModal'
import { Avatar, DueBadge, Icon, btnPrimary, inputCls, useConfirm } from './ui'

function ResponsibilityForm({ onAdd, onCancel }) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!title.trim()) return
        onAdd({ title: title.trim(), dueDate })
      }}
      className="mt-2 space-y-2 rounded-xl bg-slate-50 p-2.5 ring-1 ring-slate-100"
    >
      <input autoFocus className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Write the introduction" />
      <div className="flex gap-2">
        <input type="date" aria-label="Deadline" className={inputCls} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <button type="submit" disabled={!title.trim()} className={`${btnPrimary} px-3`}>Add</button>
        <button type="button" onClick={onCancel} className="rounded-lg px-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600" aria-label="Cancel">
          <Icon name="x" />
        </button>
      </div>
    </form>
  )
}

export default function TeamPanel({ project, members, students, currentStudentId, dispatch }) {
  const [adding, setAdding] = useState(null) // studentId whose responsibility form is open
  const [memberModal, setMemberModal] = useState(false)
  const confirm = useConfirm()

  return (
    <aside className="h-fit rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <Icon name="users" className="h-4 w-4 text-indigo-500" /> Team
            <span className="rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-500">{members.length}</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">Roles & responsibilities with deadlines</p>
        </div>
        <button onClick={() => setMemberModal(true)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
          <Icon name="userPlus" className="h-3.5 w-3.5" /> Add member
        </button>
      </div>

      <ul className="space-y-3">
        {members.map((m) => {
          const tasks = project.tasks.filter((t) => t.assigneeId === m.id)
          const open = tasks.filter((t) => t.status !== 'done').length
          const resp = project.responsibilities
            .filter((r) => r.studentId === m.id)
            .sort((a, b) => (a.dueDate || '9').localeCompare(b.dueDate || '9'))
          return (
            <li key={m.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex items-center gap-2.5">
                <Avatar name={m.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1 text-sm font-semibold text-slate-800">
                    <span className="truncate">{m.name}</span>
                    {m.id === currentStudentId && <span className="rounded-full bg-indigo-100 px-1.5 text-[10px] font-semibold text-indigo-700">you</span>}
                    {m.id === project.createdBy && <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-semibold text-amber-700">creator</span>}
                  </p>
                  <p className="text-xs text-slate-500">{open} open · {tasks.length - open} done</p>
                </div>
                {m.id !== project.createdBy && (
                  <button
                    onClick={() =>
                      confirm({
                        title: 'Remove team member?',
                        message: `${m.name} will be removed from “${project.name}”. Their tasks become unassigned and their responsibilities are deleted.`,
                        confirmLabel: 'Remove',
                        onConfirm: () => dispatch({ type: 'removeMember', projectId: project.id, studentId: m.id }),
                      })
                    }
                    className="rounded-md p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Remove ${m.name}`}
                    title="Remove from team"
                  >
                    <Icon name="x" />
                  </button>
                )}
              </div>

              {resp.length > 0 && (
                <ul className="mt-2.5 space-y-1.5 border-t border-slate-100 pt-2.5">
                  {resp.map((r) => (
                    <li key={r.id} className="group flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={r.done}
                        onChange={() => dispatch({ type: 'updateResponsibility', projectId: project.id, id: r.id, patch: { done: !r.done } })}
                        className="mt-0.5 h-4 w-4 accent-indigo-600"
                        aria-label={`Mark "${r.title}" done`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm leading-tight ${r.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{r.title}</p>
                        <DueBadge date={r.dueDate} done={r.done} />
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'deleteResponsibility', projectId: project.id, id: r.id })}
                        className="rounded p-0.5 text-slate-300 opacity-0 hover:text-rose-600 group-hover:opacity-100 focus:opacity-100"
                        aria-label={`Delete "${r.title}"`}
                      >
                        <Icon name="trash" className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {adding === m.id ? (
                <ResponsibilityForm
                  onCancel={() => setAdding(null)}
                  onAdd={({ title, dueDate }) => {
                    dispatch({ type: 'addResponsibility', projectId: project.id, responsibility: { id: uid(), studentId: m.id, title, dueDate, done: false } })
                    setAdding(null)
                  }}
                />
              ) : (
                <button onClick={() => setAdding(m.id)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                  <Icon name="plus" className="h-3.5 w-3.5" /> Add responsibility
                </button>
              )}
            </li>
          )
        })}
      </ul>

      {memberModal && <AddMemberModal project={project} students={students} dispatch={dispatch} onClose={() => setMemberModal(false)} />}
    </aside>
  )
}
