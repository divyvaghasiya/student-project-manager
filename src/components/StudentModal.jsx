import { useState } from 'react'
import { uid } from '../store'
import { COLOR_CLASSES, Field, Modal, btnPrimary, btnSecondary, inputCls } from './ui'

/** Create a new student and (optionally) add them to one or more projects right away. */
export default function StudentModal({ students, projects, defaultProjectIds = [], onSave, onClose }) {
  const [name, setName] = useState('')
  const [projectIds, setProjectIds] = useState(defaultProjectIds)
  const [makeCurrent, setMakeCurrent] = useState(false)
  const trimmed = name.trim()
  const duplicate = students.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())

  const toggle = (id) => setProjectIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const submit = (e) => {
    e.preventDefault()
    if (!trimmed || duplicate) return
    onSave({ student: { id: uid(), name: trimmed }, projectIds, makeCurrent })
  }

  return (
    <Modal title="Add a student" subtitle="New students can be added to projects as team members." onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name">
          <input autoFocus className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Patel" />
          {duplicate && <span className="mt-1 block text-xs text-rose-600">A student with this name already exists.</span>}
        </Field>

        {projects.length > 0 && (
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Add to projects</span>
            <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-1.5">
              {projects.map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-slate-50">
                  <input type="checkbox" checked={projectIds.includes(p.id)} onChange={() => toggle(p.id)} className="h-4 w-4 accent-indigo-600" />
                  <span className={`h-2 w-2 rounded-full ${COLOR_CLASSES[p.color].dot}`} />
                  <span className="truncate text-sm text-slate-700">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
          <input type="checkbox" checked={makeCurrent} onChange={(e) => setMakeCurrent(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
          This is me – switch to this student
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={btnSecondary}>Cancel</button>
          <button type="submit" disabled={!trimmed || duplicate} className={btnPrimary}>Add student</button>
        </div>
      </form>
    </Modal>
  )
}
