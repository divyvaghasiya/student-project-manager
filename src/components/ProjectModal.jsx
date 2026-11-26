import { useState } from 'react'
import { COLORS, uid } from '../store'
import { COLOR_CLASSES, Field, Icon, Modal, btnPrimary, btnSecondary, inputCls } from './ui'

export default function ProjectModal({ project, creatorId, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(
    project ?? { name: '', course: '', description: '', dueDate: '', color: 'indigo' },
  )
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(project ? form : { ...form, id: uid(), createdBy: creatorId, completed: false, memberIds: creatorId ? [creatorId] : [], tasks: [], responsibilities: [] })
  }

  return (
    <Modal
      title={project ? 'Edit project' : 'New project'}
      subtitle={project ? undefined : 'You will be added as the project creator.'}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Project name">
          <input autoFocus className={inputCls} value={form.name} onChange={set('name')} placeholder="e.g. Capstone website" />
        </Field>
        <Field label="Course">
          <input className={inputCls} value={form.course} onChange={set('course')} placeholder="e.g. CS 101 – Intro to Programming" />
        </Field>
        <Field label="Description">
          <textarea className={inputCls} rows={2} value={form.description} onChange={set('description')} placeholder="What is this project about?" />
        </Field>
        <Field label="Final deadline">
          <input type="date" className={inputCls} value={form.dueDate} onChange={set('dueDate')} />
        </Field>
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">Color</span>
          <div className="flex gap-2.5">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                aria-label={c}
                onClick={() => setForm({ ...form, color: c })}
                className={`h-7 w-7 rounded-full transition ${COLOR_CLASSES[c].dot} ${form.color === c ? `scale-110 ring-2 ring-offset-2 ${COLOR_CLASSES[c].ring}` : 'hover:scale-110'}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          {project && onDelete ? (
            <button type="button" onClick={onDelete} className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700">
              <Icon name="trash" /> Delete project
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={btnSecondary}>Cancel</button>
            <button type="submit" disabled={!form.name.trim()} className={btnPrimary}>{project ? 'Save changes' : 'Create project'}</button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
