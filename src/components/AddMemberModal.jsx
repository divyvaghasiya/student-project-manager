import { useState } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { uid } from '@/store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { StudentAvatar } from '@/components/shared'

/** Add existing students to a project, or create a brand-new student and add them. */
export default function AddMemberModal({ project, students, dispatch, onClose }) {
  const [name, setName] = useState('')
  const others = students.filter((s) => !project.memberIds.includes(s.id))
  const trimmed = name.trim()
  const existing = students.find((s) => s.name.toLowerCase() === trimmed.toLowerCase())
  const alreadyMember = existing && project.memberIds.includes(existing.id)

  const addExisting = (student) => {
    dispatch({ type: 'addMember', projectId: project.id, studentId: student.id })
    toast.success(`${student.name} joined the team`)
  }

  const addNew = (e) => {
    e.preventDefault()
    if (!trimmed || alreadyMember) return
    if (existing) {
      addExisting(existing)
    } else {
      const student = { id: uid(), name: trimmed }
      dispatch({ type: 'addStudent', student })
      addExisting(student)
    }
    setName('')
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add team members</DialogTitle>
          <DialogDescription>Invite students to “{project.name}”.</DialogDescription>
        </DialogHeader>

        <form onSubmit={addNew} className="grid gap-2">
          <Label htmlFor="m-name">New student</Label>
          <div className="flex gap-2">
            <Input id="m-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Type a name, e.g. Priya Patel" />
            <Button type="submit" disabled={!trimmed || alreadyMember}><Plus /> Add</Button>
          </div>
          {alreadyMember && <p className="text-xs text-amber-600 dark:text-amber-400">{existing.name} is already on this team.</p>}
        </form>

        <Separator />

        <div className="grid gap-2">
          <Label>Existing students</Label>
          {others.length ? (
            <ScrollArea className="max-h-64">
              <ul className="space-y-1">
                {others.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-accent">
                    <StudentAvatar name={s.name} size="sm" />
                    <span className="flex-1 truncate text-sm font-medium">{s.name}</span>
                    <Button size="sm" variant="outline" className="h-7" onClick={() => addExisting(s)}>Add</Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="rounded-lg bg-muted px-3 py-3 text-sm text-muted-foreground">Everyone is already on this team. Type a name above to add a new student.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
