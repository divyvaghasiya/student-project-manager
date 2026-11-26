import { useState } from 'react'
import { toast } from 'sonner'
import { MoreHorizontal, Plus, Trash2, UserMinus, UserPlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { uid } from '@/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import AddMemberModal from '@/components/AddMemberModal'
import { DueBadge, StudentAvatar, useConfirm } from '@/components/shared'

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
      className="mt-3 grid gap-2 rounded-lg border bg-muted/40 p-2.5"
    >
      <Input autoFocus className="h-8 bg-background" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Write the introduction" />
      <div className="flex gap-2">
        <Input type="date" aria-label="Deadline" className="h-8 bg-background" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <Button type="submit" size="sm" disabled={!title.trim()}>Add</Button>
        <Button type="button" size="icon" variant="ghost" className="size-8" onClick={onCancel} aria-label="Cancel"><X /></Button>
      </div>
    </form>
  )
}

export default function TeamPanel({ project, members, students, currentStudentId, dispatch }) {
  const [adding, setAdding] = useState(null) // studentId whose responsibility form is open
  const [memberModal, setMemberModal] = useState(false)
  const confirm = useConfirm()

  return (
    <Card className="h-fit gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Team <Badge variant="secondary" className="tabular-nums">{members.length}</Badge>
        </CardTitle>
        <CardDescription>Responsibilities and deadlines</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline" onClick={() => setMemberModal(true)}><UserPlus /> Add</Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3">
        {members.map((m) => {
          const tasks = project.tasks.filter((t) => t.assigneeId === m.id)
          const open = tasks.filter((t) => t.status !== 'done').length
          const resp = project.responsibilities
            .filter((r) => r.studentId === m.id)
            .sort((a, b) => (a.dueDate || '9').localeCompare(b.dueDate || '9'))
          const respDone = resp.filter((r) => r.done).length
          return (
            <div key={m.id} className="rounded-xl border p-3">
              <div className="flex items-center gap-3">
                <StudentAvatar name={m.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-semibold">{m.name}</span>
                    {m.id === currentStudentId && <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">You</Badge>}
                    {m.id === project.createdBy && <Badge variant="outline" className="h-4 px-1.5 text-[10px]">Creator</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {open} open task{open === 1 ? '' : 's'}
                    {resp.length > 0 && ` · ${respDone}/${resp.length} responsibilities`}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label={`Actions for ${m.name}`}>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setAdding(m.id)}><Plus /> Add responsibility</DropdownMenuItem>
                    {m.id !== project.createdBy && (
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() =>
                          confirm({
                            title: `Remove ${m.name}?`,
                            message: `${m.name} will be removed from “${project.name}”. Their tasks become unassigned and their responsibilities are deleted.`,
                            confirmLabel: 'Remove',
                            onConfirm: () => {
                              dispatch({ type: 'removeMember', projectId: project.id, studentId: m.id })
                              toast.success(`${m.name} removed from the team`)
                            },
                          })
                        }
                      >
                        <UserMinus /> Remove from team
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {resp.length > 0 && (
                <ul className="mt-3 space-y-2 border-t pt-3">
                  {resp.map((r) => (
                    <li key={r.id} className="group flex items-start gap-2.5">
                      <Checkbox
                        checked={r.done}
                        onCheckedChange={() => dispatch({ type: 'updateResponsibility', projectId: project.id, id: r.id, patch: { done: !r.done } })}
                        className="mt-0.5"
                        aria-label={`Mark "${r.title}" done`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm leading-tight', r.done && 'text-muted-foreground line-through')}>{r.title}</p>
                        <DueBadge date={r.dueDate} done={r.done} className="mt-0.5" />
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'deleteResponsibility', projectId: project.id, id: r.id })}
                        className="rounded p-0.5 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100 focus:opacity-100"
                        aria-label={`Delete "${r.title}"`}
                      >
                        <Trash2 className="size-3.5" />
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
                    toast.success('Responsibility added', { description: `${title} → ${m.name}` })
                    setAdding(null)
                  }}
                />
              ) : (
                <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs text-muted-foreground" onClick={() => setAdding(m.id)}>
                  <Plus /> Add responsibility
                </Button>
              )}
            </div>
          )
        })}
        {!members.length && <p className="py-4 text-center text-sm text-muted-foreground">No team members yet.</p>}
      </CardContent>

      {memberModal && <AddMemberModal project={project} students={students} dispatch={dispatch} onClose={() => setMemberModal(false)} />}
    </Card>
  )
}
