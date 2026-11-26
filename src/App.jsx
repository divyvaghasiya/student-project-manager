import { useState } from 'react'
import { toast } from 'sonner'
import {
  Check,
  ChevronsUpDown,
  CircleCheckBig,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Monitor,
  Moon,
  Plus,
  RotateCcw,
  Sun,
  UserPlus,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme'
import { progress, useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import Dashboard from '@/components/Dashboard'
import MyWork from '@/components/MyWork'
import ProjectModal from '@/components/ProjectModal'
import ProjectView from '@/components/ProjectView'
import StudentModal from '@/components/StudentModal'
import { StudentAvatar, projectColor, useConfirm } from '@/components/shared'

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 text-white shadow-md shadow-indigo-500/25">
        <FolderKanban className="size-4" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight">Project Manager</p>
        <p className="text-[11px] text-muted-foreground">Student workspace</p>
      </div>
    </div>
  )
}

function SectionLabel({ children, onAdd, addLabel }) {
  return (
    <div className="flex h-8 items-center justify-between px-2">
      <span className="text-xs font-medium text-muted-foreground">{children}</span>
      {onAdd && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-6 text-muted-foreground" onClick={onAdd} aria-label={addLabel}>
              <Plus className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{addLabel}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

function NavButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={cn(
        'flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors',
        active ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
      )}
    >
      {children}
    </button>
  )
}

function ThemeToggle() {
  const { theme, resolved, setTheme } = useTheme()
  const options = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change theme">
          {resolved === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((o) => (
          <DropdownMenuItem key={o.id} onClick={() => setTheme(o.id)}>
            <o.icon /> {o.label}
            {theme === o.id && <Check className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
  const title = active ? active.name : view === 'mine' ? 'My work' : 'Dashboard'

  const deleteProject = (project) =>
    confirm({
      title: 'Delete this project?',
      message: `“${project.name}” and all of its tasks and responsibilities will be permanently deleted. This can't be undone.`,
      confirmLabel: 'Delete project',
      onConfirm: () => {
        dispatch({ type: 'deleteProject', id: project.id })
        setProjectModal(null)
        setView('dashboard')
        toast.success('Project deleted', { description: project.name })
      },
    })

  const projectLink = (p) => (
    <NavButton key={p.id} active={p.id === view} onClick={() => go(p.id)}>
      <span className={cn('size-2 shrink-0 rounded-full', projectColor(p.color).dot, p.completed && 'opacity-50')} />
      <span className={cn('flex-1 truncate', p.completed && 'text-muted-foreground line-through')}>{p.name}</span>
      <span className="text-[11px] tabular-nums text-muted-foreground">{progress(p)}%</span>
    </NavButton>
  )

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-4"><Logo /></div>

      {me && (
        <div className="px-3 pb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2.5 rounded-lg border bg-background p-2 text-left shadow-xs transition-colors hover:bg-accent">
                <StudentAvatar name={me.name} size="sm" />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-sm font-medium">{me.name}</p>
                  <p className="text-[11px] text-muted-foreground">Signed in as</p>
                </div>
                <ChevronsUpDown className="size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60" align="start">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Switch student</DropdownMenuLabel>
              {state.students.map((s) => (
                <DropdownMenuItem key={s.id} onClick={() => dispatch({ type: 'setCurrentStudent', id: s.id })}>
                  <StudentAvatar name={s.name} size="xs" /> {s.name}
                  {s.id === me.id && <Check className="ml-auto" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStudentModal(true)}>
                <UserPlus /> Add student
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 px-3 py-2">
          <div className="space-y-0.5">
            <NavButton active={view === 'dashboard'} onClick={() => go('dashboard')}><LayoutDashboard className="size-4" /> Dashboard</NavButton>
            <NavButton active={view === 'mine'} onClick={() => go('mine')}><CircleCheckBig className="size-4" /> My work</NavButton>
          </div>

          <div>
            <SectionLabel onAdd={() => setProjectModal('new')} addLabel="New project">Projects</SectionLabel>
            <div className="space-y-0.5">
              {openProjects.map(projectLink)}
              {!openProjects.length && <p className="px-2 py-1 text-xs text-muted-foreground">No active projects</p>}
            </div>
          </div>

          {doneProjects.length > 0 && (
            <div>
              <SectionLabel>Completed</SectionLabel>
              <div className="space-y-0.5">{doneProjects.map(projectLink)}</div>
            </div>
          )}

          <div>
            <SectionLabel onAdd={() => setStudentModal(true)} addLabel="Add student">Students · {state.students.length}</SectionLabel>
            <div className="space-y-0.5">
              {state.students.map((s) => (
                <div key={s.id} className="group flex h-8 items-center gap-2 rounded-md px-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60">
                  <StudentAvatar name={s.name} size="xs" />
                  <span className="flex-1 truncate">{s.name}</span>
                  {state.students.length > 1 && (
                    <button
                      onClick={() =>
                        confirm({
                          title: `Remove ${s.name}?`,
                          message: `${s.name} will be removed from every project. Their tasks become unassigned and their responsibilities are deleted.`,
                          confirmLabel: 'Remove student',
                          onConfirm: () => { dispatch({ type: 'deleteStudent', id: s.id }); toast.success('Student removed', { description: s.name }) },
                        })
                      }
                      className="rounded p-0.5 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Remove ${s.name}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full border-dashed text-muted-foreground" onClick={() => setStudentModal(true)}>
              <UserPlus /> Add student
            </Button>
          </div>
        </div>
      </ScrollArea>

      <Separator />
      <div className="p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() =>
            confirm({
              title: 'Reset all data?',
              message: 'All projects, tasks and students will be replaced with the sample data.',
              confirmLabel: 'Reset',
              onConfirm: () => { dispatch({ type: 'reset' }); setView('dashboard'); toast('Sample data restored') },
            })
          }
        >
          <RotateCcw /> Reset sample data
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-muted/40 dark:bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:block">{sidebar}</aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Projects, students and pages</SheetDescription>
          {sidebar}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-lg md:px-6">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
          <nav className="flex min-w-0 items-center gap-1.5 text-sm">
            <button onClick={() => go('dashboard')} className="hidden text-muted-foreground hover:text-foreground sm:inline">Workspace</button>
            <span className="hidden text-muted-foreground/50 sm:inline">/</span>
            <span className="truncate font-medium">{title}</span>
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <Button size="sm" onClick={() => setProjectModal('new')}>
              <Plus /> <span className="hidden sm:inline">New project</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {active ? (
              <ProjectView
                key={active.id}
                project={active}
                students={state.students}
                currentStudentId={me?.id}
                dispatch={dispatch}
                onEditProject={() => setProjectModal(active)}
                onDeleteProject={() => deleteProject(active)}
              />
            ) : view === 'mine' && me ? (
              <MyWork student={me} projects={state.projects} dispatch={dispatch} onOpen={go} />
            ) : (
              <Dashboard
                projects={state.projects}
                students={state.students}
                me={me}
                onOpen={go}
                onNew={() => setProjectModal('new')}
                onAddStudent={() => setStudentModal(true)}
              />
            )}
          </div>
        </main>
      </div>

      {projectModal && (
        <ProjectModal
          project={projectModal === 'new' ? null : projectModal}
          creatorId={me?.id}
          onClose={() => setProjectModal(null)}
          onSave={(p) => {
            if (projectModal === 'new') {
              dispatch({ type: 'addProject', project: p })
              setView(p.id)
              toast.success('Project created', { description: p.name })
            } else {
              dispatch({ type: 'updateProject', id: p.id, patch: p })
              toast.success('Project updated')
            }
            setProjectModal(null)
          }}
          onDelete={() => deleteProject(projectModal)}
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
            toast.success('Student added', { description: student.name })
          }}
        />
      )}
    </div>
  )
}
