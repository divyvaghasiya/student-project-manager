import { useState } from 'react'
import { PRIORITIES, STATUSES, uid } from '../store'
import { Field, Modal, btnPrimary, btnSecondary, inputCls } from './ui'

export default function TaskModal({ task, members, defaultStatus = 'todo', onSave, onDelete, onClose }) {
  const [form, setForm] = useState(
    task ?? { title: '', status: defaultStatus, priority: 'medium', assigneeId: null, dueDate: '' },
  )
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value || (k === 'assigneeId' ? null : '') })

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave(task ? form : { ...form, id: uid() })
  }

  return (
    <Modal title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Title">
          <input autoFocus className={inputCls} value={form.title} onChange={set('title')} placeholder="What needs doing?" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={set('status')}>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select className={inputCls} value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
            </select>
          </Field>
          <Field label="Assignee">
            <select className={inputCls} value={form.assigneeId ?? ''} onChange={set('assigneeId')}>
              <option value="">Unassigned</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="Due date">
            <input type="date" className={inputCls} value={form.dueDate} onChange={set('dueDate')} />
          </Field>
        </div>
        <div className="flex items-center justify-between pt-2">
          {task && onDelete ? (
            <button type="button" onClick={onDelete} className="text-sm font-medium text-rose-600 hover:underline">
              Delete task
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={btnSecondary}>Cancel</button>
            <button type="submit" disabled={!form.title.trim()} className={btnPrimary}>Save</button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
