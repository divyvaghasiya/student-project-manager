import { AlertTriangle, ArrowUpRight, CalendarClock, CheckCircle2, FolderKanban, ListTodo, Plus, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { daysUntil, progress } from '@/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AvatarStack, DueBadge, EmptyState, StudentAvatar, projectColor } from '@/components/shared'

function StatCard({ label, value, hint, icon: IconCmp, tone }) {
  return (
    <Card className="gap-0 py-5">
      <CardContent className="flex items-start justify-between px-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className={cn('flex size-9 items-center justify-center rounded-lg', tone)}>
          <IconCmp className="size-4" />
        </div>
      </CardContent>
    </Card>
  )
}

function ProjectCard({ project, students, onOpen }) {
  const pct = progress(project)
  const c = projectColor(project.color)
  const members = project.memberIds.map((id) => students.find((s) => s.id === id)).filter(Boolean)
  const done = project.tasks.filter((t) => t.status === 'done').length
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onOpen(project.id)}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(project.id)}
      className={cn(
        'group relative cursor-pointer gap-0 overflow-hidden py-0 transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        project.completed && 'opacity-80',
      )}
    >
      <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent', c.glow)} />
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold', c.soft)}>
              {project.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold tracking-tight">{project.name}</h3>
              <p className="truncate text-xs text-muted-foreground">{project.course || 'No course'}</p>
            </div>
          </div>
          {project.completed ? (
            <Badge variant="secondary" className="shrink-0 gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-3" /> Completed
            </Badge>
          ) : (
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
          )}
        </div>
        {project.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{done}/{project.tasks.length} tasks</span>
            <span className="font-medium tabular-nums">{pct}%</span>
          </div>
          <Progress value={pct} className="h-1.5" indicatorClassName={c.indicator} />
        </div>
      </div>
      <div className="relative flex items-center justify-between border-t bg-muted/30 px-5 py-3">
        {members.length ? <AvatarStack people={members} /> : <span className="text-xs text-muted-foreground">No members</span>}
        <DueBadge date={project.dueDate} done={project.completed || pct === 100} />
      </div>
    </Card>
  )
}

function TaskRow({ task, studentById, onOpen }) {
  const assignee = studentById[task.assigneeId]
  return (
    <button onClick={() => onOpen(task.project.id)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/60">
      <span className={cn('h-8 w-1 shrink-0 rounded-full', projectColor(task.project.color).dot)} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{task.title}</p>
        <p className="truncate text-xs text-muted-foreground">{task.project.name}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <DueBadge date={task.dueDate} />
        {assignee && <StudentAvatar name={assignee.name} size="xs" tooltip />}
      </div>
    </button>
  )
}

export default function Dashboard({ projects, students, me, onOpen, onNew, onAddStudent }) {
  const active = projects.filter((p) => !p.completed)
  const completed = projects.filter((p) => p.completed)
  const allTasks = active.flatMap((p) => p.tasks.map((t) => ({ ...t, project: p })))
  const open = allTasks.filter((t) => t.status !== 'done')
  const doneCount = allTasks.length - open.length
  const overdue = open.filter((t) => t.dueDate && daysUntil(t.dueDate) < 0).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const upcoming = open
    .filter((t) => t.dueDate && daysUntil(t.dueDate) >= 0 && daysUntil(t.dueDate) <= 7)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const studentById = Object.fromEntries(students.map((s) => [s.id, s]))
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting}{me ? `, ${me.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-muted-foreground">Here's what's happening across your semester projects.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onAddStudent}><UserPlus /> Add student</Button>
          <Button onClick={onNew}><Plus /> New project</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active projects" value={active.length} hint={`${completed.length} completed`} icon={FolderKanban} tone="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" />
        <StatCard label="Open tasks" value={open.length} hint={`${doneCount} done so far`} icon={ListTodo} tone="bg-sky-500/10 text-sky-600 dark:text-sky-400" />
        <StatCard label="Due this week" value={upcoming.length} hint="Next 7 days" icon={CalendarClock} tone="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
        <StatCard
          label="Overdue"
          value={overdue.length}
          hint={overdue.length ? 'Needs attention' : 'All on track'}
          icon={AlertTriangle}
          tone={overdue.length ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Active projects</h2>
              <span className="text-sm text-muted-foreground">{active.length} total</span>
            </div>
            {active.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {active.map((p) => <ProjectCard key={p.id} project={p} students={students} onOpen={onOpen} />)}
              </div>
            ) : (
              <EmptyState icon={FolderKanban} title="No active projects" description="Create a project for your team to start tracking tasks and deadlines.">
                <Button onClick={onNew}><Plus /> New project</Button>
              </EmptyState>
            )}
          </section>

          {completed.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold tracking-tight">Completed</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {completed.map((p) => <ProjectCard key={p.id} project={p} students={students} onOpen={onOpen} />)}
              </div>
            </section>
          )}
        </div>

        <Card className="h-fit gap-4">
          <CardHeader>
            <CardTitle>Deadlines</CardTitle>
            <CardDescription>Tasks that need attention soon</CardDescription>
          </CardHeader>
          <CardContent className="px-3">
            <Tabs defaultValue="upcoming">
              <TabsList className="mx-3 mb-2 grid grid-cols-2" style={{ width: 'calc(100% - 1.5rem)' }}>
                <TabsTrigger value="upcoming">Upcoming · {upcoming.length}</TabsTrigger>
                <TabsTrigger value="overdue">Overdue · {overdue.length}</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming">
                {upcoming.length ? (
                  upcoming.map((t) => <TaskRow key={t.id} task={t} studentById={studentById} onOpen={onOpen} />)
                ) : (
                  <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nothing due in the next 7 days 🎉</p>
                )}
              </TabsContent>
              <TabsContent value="overdue">
                {overdue.length ? (
                  overdue.map((t) => <TaskRow key={t.id} task={t} studentById={studentById} onOpen={onOpen} />)
                ) : (
                  <p className="px-3 py-8 text-center text-sm text-muted-foreground">No overdue tasks. Nice work!</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
