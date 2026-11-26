import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COLORS, uid } from '@/store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { projectColor } from '@/components/shared'

export default function ProjectModal({ project, creatorId, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(project ?? { name: '', course: '', description: '', dueDate: '', color: 'indigo' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const clean = { ...form, name: form.name.trim() }
    onSave(project ? clean : { ...clean, id: uid(), createdBy: creatorId, completed: false, memberIds: creatorId ? [creatorId] : [], tasks: [], responsibilities: [] })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit project' : 'Create a project'}</DialogTitle>
          <DialogDescription>
            {project ? 'Update the project details.' : 'You will be added to the team as the project creator.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="p-name">Project name</Label>
            <Input id="p-name" autoFocus value={form.name} onChange={set('name')} placeholder="e.g. Capstone website" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="p-course">Course</Label>
              <Input id="p-course" value={form.course} onChange={set('course')} placeholder="e.g. CS 101" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-due">Final deadline</Label>
              <Input id="p-due" type="date" value={form.dueDate} onChange={set('dueDate')} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" rows={3} value={form.description} onChange={set('description')} placeholder="What is this project about?" />
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  aria-label={c}
                  aria-pressed={form.color === c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full text-white transition hover:scale-110',
                    projectColor(c).dot,
                    form.color === c && cn('ring-2 ring-offset-2 ring-offset-background', projectColor(c).ring),
                  )}
                >
                  {form.color === c && <Check className="size-3.5" />}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter className="mt-2 sm:justify-between">
            {project && onDelete ? (
              <Button type="button" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={onDelete}>
                <Trash2 /> Delete project
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={!form.name.trim()}>{project ? 'Save changes' : 'Create project'}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
