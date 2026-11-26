import { ChevronLeft, ChevronRight, Circle, CircleCheck, CircleDashed, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUSES } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { DueBadge, EmptyState, PriorityBadge, StudentAvatar, projectColor } from '@/components/shared'

const byDate = (a, b) => (a.dueDate || '9').localeCompare(b.dueDate || '9')
const COLUMN = {
  todo: { icon: Circle, tone: 'text-muted-foreground' },
  doing: { icon: CircleDashed, tone: 'text-sky-500' },
  done: { icon: CircleCheck, tone: 'text-emerald-500' },
}

function ProjectTag({ project, onOpen }) {
  return (
    <button onClick={() => onOpen(project.id)} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
      <span className={cn('size-1.5 rounded-full', projectColor(project.color).dot)} />
      {project.name}
    </button>
  )
}

export default function MyWork({ student, projects, dispatch, onOpen }) {
  const mine = projects.filter((p) => p.memberIds.includes(student.id))
  const tasks = mine.flatMap((p) => p.tasks.filter((t) => t.assigneeId === student.id).map((t) => ({ ...t, project: p })))
  const resp = mine
    .flatMap((p) => p.responsibilities.filter((r) => r.studentId === student.id).map((r) => ({ ...r, project: p })))
    .sort(byDate)
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const pct = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <StudentAvatar name={student.name} size="lg" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">My work</h1>
          <p className="text-muted-foreground">
            {student.name} · {mine.length} project{mine.length === 1 ? '' : 's'}
          </p>
        </div>
        <Card className="w-full gap-0 py-4 sm:w-64">
          <CardContent className="px-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Tasks completed</span>
              <span className="font-semibold tabular-nums">{doneTasks}/{tasks.length}</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </CardContent>
        </Card>
      </div>

      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Responsibilities</CardTitle>
          <CardDescription>Your roles across all projects, sorted by deadline</CardDescription>
        </CardHeader>
        <CardContent>
          {resp.length ? (
            <ul className="divide-y rounded-lg border">
              {resp.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                  <Checkbox
                    checked={r.done}
                    onCheckedChange={() => dispatch({ type: 'updateResponsibility', projectId: r.project.id, id: r.id, patch: { done: !r.done } })}
                    aria-label={`Mark "${r.title}" done`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-sm font-medium', r.done && 'text-muted-foreground line-through')}>{r.title}</p>
                    <ProjectTag project={r.project} onOpen={onOpen} />
                  </div>
                  <DueBadge date={r.dueDate} done={r.done} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={ClipboardList} title="No responsibilities yet" description="Responsibilities assigned to you in a project's Team panel will show up here." />
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">My tasks</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {STATUSES.map((col, i) => {
            const items = tasks.filter((t) => t.status === col.id).sort(byDate)
            const { icon: ColIcon, tone } = COLUMN[col.id]
            return (
              <section key={col.id} className="rounded-xl border bg-muted/50 p-2 dark:bg-muted/20">
                <h3 className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium">
                  <ColIcon className={cn('size-4', tone)} /> {col.label}
                  <span className="text-xs font-normal text-muted-foreground tabular-nums">{items.length}</span>
                </h3>
                <ul className="mt-1 space-y-2">
                  {items.map((t) => (
                    <li key={t.id} className="rounded-lg border bg-card p-3 shadow-xs">
                      <p className={cn('text-sm font-medium', t.status === 'done' && 'text-muted-foreground line-through')}>{t.title}</p>
                      <ProjectTag project={t.project} onOpen={onOpen} />
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={t.priority} />
                          <DueBadge date={t.dueDate} done={t.status === 'done'} />
                        </div>
                        <div className="flex gap-1">
                          {i > 0 && (
                            <Button variant="outline" size="icon" className="size-6" aria-label={`Move to ${STATUSES[i - 1].label}`}
                              onClick={() => dispatch({ type: 'updateTask', projectId: t.project.id, taskId: t.id, patch: { status: STATUSES[i - 1].id } })}>
                              <ChevronLeft className="size-3.5" />
                            </Button>
                          )}
                          {i < STATUSES.length - 1 && (
                            <Button variant="outline" size="icon" className="size-6" aria-label={`Move to ${STATUSES[i + 1].label}`}
                              onClick={() => dispatch({ type: 'updateTask', projectId: t.project.id, taskId: t.id, patch: { status: STATUSES[i + 1].id } })}>
                              <ChevronRight className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                  {!items.length && <li className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">Nothing here</li>}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
