import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, MoreHorizontal, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUSES, progress } from '@/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Board from '@/components/Board'
import TaskModal from '@/components/TaskModal'
import TeamPanel from '@/components/TeamPanel'
import { AvatarStack, DueBadge, StudentAvatar, projectColor } from '@/components/shared'

function Meta({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

export default function ProjectView({ project, students, currentStudentId, dispatch, onEditProject, onDeleteProject }) {
  const [taskModal, setTaskModal] = useState(null) // { task?, status? }
  const [filter, setFilter] = useState('all')
  const members = project.memberIds.map((id) => students.find((s) => s.id === id)).filter(Boolean)
  const creator = students.find((s) => s.id === project.createdBy)
  const pct = progress(project)
  const c = projectColor(project.color)
  const counts = Object.fromEntries(STATUSES.map((s) => [s.id, project.tasks.filter((t) => t.status === s.id).length]))

  const toggleComplete = () => {
    dispatch({ type: 'updateProject', id: project.id, patch: { completed: !project.completed } })
    toast.success(project.completed ? 'Project reopened' : 'Project marked as completed', { description: project.name })
  }

  return (
    <div className="space-y-6">
      {project.completed && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="size-4" /> This project is completed. Keep it for reference, reopen it, or delete it.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={toggleComplete}><RotateCcw /> Reopen</Button>
            <Button size="sm" variant="destructive" onClick={onDeleteProject}><Trash2 /> Delete</Button>
          </div>
        </div>
      )}

      <Card className="relative gap-0 overflow-hidden py-0">
        <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b to-transparent', c.glow)} />
        <div className="relative flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="flex min-w-0 gap-4">
            <div className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold', c.soft)}>
              {project.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
                {project.completed && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Completed</Badge>}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{project.course || 'No course'}</p>
              {project.description && <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{project.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onEditProject}><Pencil /> Edit</Button>
            <Button onClick={() => setTaskModal({ status: 'todo' })}><Plus /> Add task</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More project actions"><MoreHorizontal /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={onEditProject}><Pencil /> Edit project</DropdownMenuItem>
                <DropdownMenuItem onClick={toggleComplete}>
                  {project.completed ? <><RotateCcw /> Reopen project</> : <><CheckCircle2 /> Mark as completed</>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onDeleteProject}><Trash2 /> Delete project</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="relative grid gap-6 border-t bg-muted/30 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <Meta label="Progress">
            <div className="flex items-center gap-3">
              <Progress value={pct} className="h-1.5 flex-1" indicatorClassName={c.indicator} />
              <span className="text-sm font-semibold tabular-nums">{pct}%</span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {counts.todo} to do · {counts.doing} in progress · {counts.done} done
            </p>
          </Meta>
          <Meta label="Final deadline">
            {project.dueDate ? (
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">
                  {new Date(project.dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <DueBadge date={project.dueDate} done={project.completed || pct === 100} />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Not set</span>
            )}
          </Meta>
          <Meta label="Team">
            {members.length ? <AvatarStack people={members} max={5} /> : <span className="text-sm text-muted-foreground">No members</span>}
          </Meta>
          <Meta label="Created by">
            {creator ? (
              <div className="flex items-center gap-2">
                <StudentAvatar name={creator.name} size="xs" />
                <span className="truncate text-sm font-medium">{creator.name}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Unknown</span>
            )}
          </Meta>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {[{ id: 'all', name: 'Everyone' }, ...members, { id: 'unassigned', name: 'Unassigned' }].map((m) => (
              <Button
                key={m.id}
                size="sm"
                variant={filter === m.id ? 'default' : 'outline'}
                className="h-7 rounded-full px-3 text-xs"
                onClick={() => setFilter(m.id)}
              >
                {m.id === currentStudentId ? `${m.name} (you)` : m.name}
              </Button>
            ))}
          </div>
          <Board
            project={project}
            members={members}
            filter={filter}
            onMove={(taskId, status) => dispatch({ type: 'updateTask', projectId: project.id, taskId, patch: { status } })}
            onEdit={(task) => setTaskModal({ task })}
            onAdd={(status) => setTaskModal({ status })}
          />
        </div>

        <TeamPanel project={project} members={members} students={students} currentStudentId={currentStudentId} dispatch={dispatch} />
      </div>

      {taskModal && (
        <TaskModal
          task={taskModal.task}
          defaultStatus={taskModal.status}
          members={members}
          onClose={() => setTaskModal(null)}
          onSave={(task) => {
            dispatch(
              taskModal.task
                ? { type: 'updateTask', projectId: project.id, taskId: task.id, patch: task }
                : { type: 'addTask', projectId: project.id, task },
            )
            toast.success(taskModal.task ? 'Task updated' : 'Task added', { description: task.title })
            setTaskModal(null)
          }}
          onDelete={() => {
            dispatch({ type: 'deleteTask', projectId: project.id, taskId: taskModal.task.id })
            toast.success('Task deleted', { description: taskModal.task.title })
            setTaskModal(null)
          }}
        />
      )}
    </div>
  )
}
