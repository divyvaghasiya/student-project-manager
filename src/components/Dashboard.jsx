import { daysUntil, progress } from '../store'
import { AvatarStack, COLOR_CLASSES, DueBadge, EmptyState, Icon, ProgressBar, btnPrimary, btnSecondary } from './ui'

function ProjectCard({ project, students, onOpen }) {
  const pct = progress(project)
  const members = project.memberIds.map((id) => students.find((s) => s.id === id)).filter(Boolean)
  return (
    <button
      onClick={() => onOpen(project.id)}
      className={`group flex flex-col rounded-2xl border border-t-4 border-slate-200/80 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${COLOR_CLASSES[project.color].border} ${project.completed ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`truncate rounded-full px-2 py-0.5 text-[11px] font-semibold ${COLOR_CLASSES[project.color].soft}`}>{project.course || 'No course'}</span>
        {project.completed && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <Icon name="check" className="h-3 w-3" /> Completed
          </span>
        )}
      </div>
      <h3 className="mt-2.5 truncate text-base font-bold text-slate-900 group-hover:text-indigo-700">{project.name}</h3>
      {project.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.description}</p>}
      <div className="mt-auto pt-5">
        <div className="mb-1.5 flex justify-between text-xs text-slate-500">
          <span>{project.tasks.length} tasks</span>
          <span className="font-bold text-slate-700">{pct}%</span>
        </div>
        <ProgressBar value={pct} color={project.color} />
        <div className="mt-4 flex items-center justify-between">
          <AvatarStack people={members} />
          <DueBadge date={project.dueDate} done={project.completed || pct === 100} />
        </div>
      </div>
    </button>
  )
}

export default function Dashboard({ projects, students, me, onOpen, onNew, onAddStudent }) {
  const active = projects.filter((p) => !p.completed)
  const completed = projects.filter((p) => p.completed)
  const allTasks = active.flatMap((p) => p.tasks.map((t) => ({ ...t, project: p })))
  const open = allTasks.filter((t) => t.status !== 'done')
  const overdue = open.filter((t) => t.dueDate && daysUntil(t.dueDate) < 0)
  const upcoming = open
    .filter((t) => t.dueDate && daysUntil(t.dueDate) >= 0 && daysUntil(t.dueDate) <= 7)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const studentById = Object.fromEntries(students.map((s) => [s.id, s]))

  const stats = [
    { label: 'Active projects', value: active.length, icon: 'folder', tint: 'bg-indigo-50 text-indigo-600' },
    { label: 'Open tasks', value: open.length, icon: 'clipboard', tint: 'bg-sky-50 text-sky-600' },
    { label: 'Due this week', value: upcoming.length, icon: 'calendar', tint: 'bg-amber-50 text-amber-600' },
    { label: 'Overdue', value: overdue.length, icon: 'alert', tint: overdue.length ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600">Welcome back{me ? `, ${me.name.split(' ')[0]}` : ''} 👋</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Everything your semester project teams are working on.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onAddStudent} className={btnSecondary}><Icon name="userPlus" /> Add student</button>
          <button onClick={onNew} className={btnPrimary}><Icon name="plus" /> New project</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <span className={`rounded-xl p-2.5 ${s.tint}`}><Icon name={s.icon} className="h-5 w-5" /></span>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <section className="space-y-8">
          <div>
            <h2 className="mb-4 text-lg font-bold text-slate-900">Active projects</h2>
            {active.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {active.map((p) => <ProjectCard key={p.id} project={p} students={students} onOpen={onOpen} />)}
              </div>
            ) : (
              <EmptyState title="No active projects">
                <button onClick={onNew} className={`${btnPrimary} mt-3`}><Icon name="plus" /> Create a project</button>
              </EmptyState>
            )}
          </div>
          {completed.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-bold text-slate-900">Completed</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {completed.map((p) => <ProjectCard key={p.id} project={p} students={students} onOpen={onOpen} />)}
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Coming up</h2>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            {[...overdue, ...upcoming].map((t) => (
              <li key={t.id}>
                <button onClick={() => onOpen(t.project.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50">
                  <span className={`h-9 w-1 shrink-0 rounded-full ${COLOR_CLASSES[t.project.color].dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{t.title}</p>
                    <p className="truncate text-xs text-slate-500">
                      {t.project.name}
                      {studentById[t.assigneeId] && ` · ${studentById[t.assigneeId].name}`}
                    </p>
                  </div>
                  <DueBadge date={t.dueDate} />
                </button>
              </li>
            ))}
            {!overdue.length && !upcoming.length && <li className="px-4 py-8 text-center text-sm text-slate-400">Nothing due in the next 7 days 🎉</li>}
          </ul>
        </section>
      </div>
    </div>
  )
}
