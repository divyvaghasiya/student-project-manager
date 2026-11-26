import { useState } from 'react'
import { uid } from '@/store'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StudentAvatar, projectColor } from '@/components/shared'

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
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a student</DialogTitle>
          <DialogDescription>Add a teammate to your workspace and choose which projects they join.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="s-name">Full name</Label>
            <div className="flex items-center gap-3">
              <StudentAvatar name={trimmed || '?'} size="md" />
              <Input id="s-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Patel" aria-invalid={duplicate || undefined} />
            </div>
            {duplicate && <p className="text-xs text-destructive">A student with this name already exists.</p>}
          </div>

          {projects.length > 0 && (
            <div className="grid gap-2">
              <Label>Add to projects</Label>
              <ScrollArea className="max-h-44 rounded-lg border">
                <div className="p-1">
                  {projects.map((p) => (
                    <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-accent">
                      <Checkbox checked={projectIds.includes(p.id)} onCheckedChange={() => toggle(p.id)} />
                      <span className={`size-2 rounded-full ${projectColor(p.color).dot}`} />
                      <span className="truncate">{p.name}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm hover:bg-accent/50">
            <Checkbox checked={makeCurrent} onCheckedChange={(v) => setMakeCurrent(!!v)} className="mt-0.5" />
            <span>
              <span className="font-medium">This is me</span>
              <span className="block text-xs text-muted-foreground">Switch to this student after adding them.</span>
            </span>
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!trimmed || duplicate}>Add student</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
