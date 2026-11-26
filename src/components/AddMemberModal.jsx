import { useState } from 'react'
import { uid } from '../store'
import { Avatar, Icon, Modal, btnPrimary, inputCls } from './ui'

/** Add existing students to a project, or create a brand-new student and add them. */
export default function AddMemberModal({ project, students, dispatch, onClose }) {
  const [name, setName] = useState('')
  const others = students.filter((s) => !project.memberIds.includes(s.id))
  const trimmed = name.trim()
  const existing = students.find((s) => s.name.toLowerCase() === trimmed.toLowerCase())

  const addExisting = (studentId) => dispatch({ type: 'addMember', projectId: project.id, studentId })

  const addNew = (e) => {
    e.preventDefault()
    if (!trimmed) return
    if (existing) {
      addExisting(existing.id)
    } else {
      const student = { id: uid(), name: trimmed }
      dispatch({ type: 'addStudent', student })
      addExisting(student.id)
    }
    setName('')
  }

  return (
    <Modal title="Add team members" subtitle={`Add students to “${project.name}”.`} onClose={onClose}>
      <form onSubmit={addNew}>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">New student</span>
        <div className="flex gap-2">
          <input autoFocus className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Type a name, e.g. Priya Patel" />
          <button type="submit" disabled={!trimmed} className={btnPrimary}>
            <Icon name="plus" /> Add
          </button>
        </div>
        {existing && project.memberIds.includes(existing.id) && (
          <p className="mt-1 text-xs text-amber-600">{existing.name} is already on this team.</p>
        )}
      </form>

      <div className="mt-5">
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">Existing students</span>
        {others.length ? (
          <ul className="max-h-60 space-y-1 overflow-y-auto">
            {others.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                <Avatar name={s.name} size="sm" />
                <span className="flex-1 truncate text-sm font-medium text-slate-700">{s.name}</span>
                <button onClick={() => addExisting(s.id)} className="rounded-md px-2.5 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-200 hover:bg-indigo-50">
                  Add
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500">Everyone is already on this team. Type a name above to add a new student.</p>
        )}
      </div>
    </Modal>
  )
}
