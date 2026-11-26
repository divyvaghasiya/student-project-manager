import { useState } from 'react'
import { progress, useStore } from './store'
import Dashboard from './components/Dashboard'
import MyWork from './components/MyWork'
import ProjectModal from './components/ProjectModal'
import ProjectView from './components/ProjectView'
import StudentModal from './components/StudentModal'
import { Avatar, COLOR_CLASSES, Icon, useConfirm } from './components/ui'

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/40">
        <Icon name="clipboard" className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <p className="font-bold text-white">Project Manager</p>
        <p className="text-[11px] text-slate-400">for student teams</p>
      </div>
    </div>
  )
}

export default function App() {
  const [state, dispatch] = useStore()
  const [view, setView] = useState('dashboard') // 'dashboard' | 'mine' | projectId
  const [projectModal, setProjectModal] = useState(null) // 'new' | project
  const [studentModal, setStudentModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const confirm = useConfirm()

  const me = state.students.find((s) => s.id === state.currentStudentId) ?? state.students[0]
  const active = state.projects.find((p) => p.id === view) ?? null
  const openProjects = state.projects.filter((p) => !p.completed)
  const doneProjects = state.projects.filter((p) => p.completed)
  const go = (v) => { setView(v); setMenuOpen(false) }

  const confirmDeleteProject = (project) =>
    confirm({
      title: 'Delete this project?',
      message: `“${project.name}” and all of its tasks and responsibilities will be permanently deleted. This can't be undone.`,
      confirmLabel: 'Delete project',
      onConfirm: () => {
        dispatch({ type: 'deleteProject', id: project.id })
        setProjectModal(null)
        setView('dashboard')
      },
    })

  const navItem = (selected) =>
    `flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${selected ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`

  const projectLink = (p) => (
    <button key={p.id} onClick={() => go(p.id)} className={navItem(p.id === view)}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${COLOR_CLASSES[p.color].dot} ${p.completed ? 'opacity-50' : ''}`} />
      <span className={`flex-1 truncate ${p.completed ? 'line-through opacity-70' : ''}`}>{p.name}</span>
      <span className="text-[11px] tabular-nums text-slate-500">{progress(p)}%</span>
    </button>
  )

  const sectionHead = (label, onAdd, addLabel) => (
    <div className="mt-6 mb-1.5 flex items-center justify-between px-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      {onAdd && (
        <button onClick={onAdd} className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white" aria-label={addLabel} title={addLabel}>
          <Icon name="plus" className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 md:flex">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-slate-950 px-4 py-3 md:hidden">
        <Logo />
        <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" aria-label="Toggle menu">
          <Icon name="menu" className="h-5 w-5" />
        </button>
      </div>

      <aside className={`${menuOpen ? 'block' : 'hidden'} w-full shrink-0 bg-slate-950 px-3 py-5 md:sticky md:top-0 md:flex md:h-screen md:w-72 md:flex-col md:overflow-y-auto`}>
        <div className="mb-6 hidden px-2 md:block"><Logo /></div>

        {me && (
          <div className="mb-5 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Signed in as</span>
            <div className="flex items-center gap-2.5">
              <Avatar name={me.name} size="md" />
              <select
                value={me.id}
                onChange={(e) => dispatch({ type: 'setCurrentStudent', id: e.target.value })}
                className="min-w-0 flex-1 cursor-pointer truncate rounded-md bg-transparent py-1 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Switch student"
              >
                {state.students.map((s) => <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>)}
              </select>
            </div>
          </div>
        )}

        <nav className="space-y-0.5">
          <button onClick={() => go('dashboard')} className={navItem(view === 'dashboard')}><Icon name="home" /> Dashboard</button>
          <button onClick={() => go('mine')} className={navItem(view === 'mine')}><Icon name="checkCircle" /> My work</button>
        </nav>

        {sectionHead('Projects', () => setProjectModal('new'), 'New project')}
        <nav className="space-y-0.5">
          {openProjects.map(projectLink)}
          {!openProjects.length && <p className="px-3 py-1 text-xs text-slate-500">No active projects</p>}
        </nav>

        {doneProjects.length > 0 && (
          <>
            {sectionHead('Completed')}
            <nav className="space-y-0.5">{doneProjects.map(projectLink)}</nav>
          </>
        )}

        {sectionHead(`Students (${state.students.length})`, () => setStudentModal(true), 'Add student')}
        <ul className="space-y-0.5">
          {state.students.map((s) => (
            <li key={s.id} className="group flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5">
              <Avatar name={s.name} size="xs" />
              <span className="flex-1 truncate">{s.name}</span>
              {state.students.length > 1 && (
                <button
                  onClick={() =>
                    confirm({
                      title: 'Remove student?',
                      message: `${s.name} will be removed from every project. Their tasks become unassigned and their responsibilities are deleted.`,
                      confirmLabel: 'Remove student',
                      onConfirm: () => dispatch({ type: 'deleteStudent', id: s.id }),
                    })
                  }
                  className="rounded p-0.5 text-slate-500 opacity-0 hover:text-rose-400 group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Remove ${s.name}`}
                >
                  <Icon name="x" className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
        <button onClick={() => setStudentModal(true)} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/15 px-3 py-2 text-sm font-medium text-slate-300 hover:border-indigo-400 hover:bg-white/5 hover:text-white">
          <Icon name="userPlus" /> Add student
        </button>

        <button
          onClick={() =>
            confirm({
              title: 'Reset all data?',
              message: 'All projects, tasks and students will be replaced with the sample data.',
              confirmLabel: 'Reset',
              onConfirm: () => { dispatch({ type: 'reset' }); setView('dashboard') },
            })
          }
          className="mt-6 flex items-center gap-1.5 px-3 text-xs text-slate-500 hover:text-slate-300 md:mt-auto md:pt-6"
        >
          <Icon name="refresh" className="h-3.5 w-3.5" /> Reset sample data
        </button>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">
          {active ? (
            <ProjectView
              key={active.id}
              project={active}
              students={state.students}
              currentStudentId={me?.id}
              dispatch={dispatch}
              onEditProject={() => setProjectModal(active)}
              onDeleted={() => setView('dashboard')}
            />
          ) : view === 'mine' && me ? (
            <MyWork student={me} projects={state.projects} dispatch={dispatch} onOpen={go} />
          ) : (
            <Dashboard projects={state.projects} students={state.students} me={me} onOpen={go} onNew={() => setProjectModal('new')} onAddStudent={() => setStudentModal(true)} />
          )}
        </div>
      </main>

      {projectModal && (
        <ProjectModal
          project={projectModal === 'new' ? null : projectModal}
          creatorId={me?.id}
          onClose={() => setProjectModal(null)}
          onSave={(p) => {
            if (projectModal === 'new') {
              dispatch({ type: 'addProject', project: p })
              setView(p.id)
            } else {
              dispatch({ type: 'updateProject', id: p.id, patch: p })
            }
            setProjectModal(null)
          }}
          onDelete={() => confirmDeleteProject(projectModal)}
        />
      )}

      {studentModal && (
        <StudentModal
          students={state.students}
          projects={openProjects}
          defaultProjectIds={active && !active.completed ? [active.id] : []}
          onClose={() => setStudentModal(false)}
          onSave={({ student, projectIds, makeCurrent }) => {
            dispatch({ type: 'addStudent', student })
            projectIds.forEach((projectId) => dispatch({ type: 'addMember', projectId, studentId: student.id }))
            if (makeCurrent) dispatch({ type: 'setCurrentStudent', id: student.id })
            setStudentModal(false)
          }}
        />
      )}
    </div>
  )
}
