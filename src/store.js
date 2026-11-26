import { useEffect, useReducer } from 'react'

const STORAGE_KEY = 'spm:v2'

export const STATUSES = [
  { id: 'todo', label: 'To do' },
  { id: 'doing', label: 'In progress' },
  { id: 'done', label: 'Done' },
]

export const PRIORITIES = ['low', 'medium', 'high']

export const COLORS = ['indigo', 'emerald', 'amber', 'rose', 'sky', 'violet']

export const uid = () => Math.random().toString(36).slice(2, 10)

const daysFromNow = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

/*
 * Data model
 *   students:         [{ id, name }]                       – everyone on any team
 *   currentStudentId: id of the student using the app
 *   projects: [{
 *     id, name, course, description, dueDate, color,
 *     createdBy: studentId, completed: boolean,
 *     memberIds: [studentId],
 *     tasks: [{ id, title, status, priority, assigneeId, dueDate }],
 *     responsibilities: [{ id, studentId, title, dueDate, done }],
 *   }]
 */
function seed() {
  const s = (name) => ({ id: uid(), name })
  const aisha = s('Aisha Khan'), ben = s('Ben Ortiz'), chen = s('Chen Wei'), dana = s('Dana Lee'), eli = s('Eli Brooks')
  return {
    students: [aisha, ben, chen, dana, eli],
    currentStudentId: aisha.id,
    projects: [
      {
        id: uid(),
        name: 'Campus Recycling App',
        course: 'CS 350 – Software Engineering',
        description: 'Semester project: a mobile-friendly web app that maps recycling bins on campus.',
        dueDate: daysFromNow(21),
        color: 'emerald',
        createdBy: aisha.id,
        memberIds: [aisha.id, ben.id, chen.id],
        responsibilities: [
          { id: uid(), studentId: aisha.id, title: 'Team lead & requirements', dueDate: daysFromNow(4), done: false },
          { id: uid(), studentId: ben.id, title: 'Frontend & map integration', dueDate: daysFromNow(12), done: false },
          { id: uid(), studentId: chen.id, title: 'UI design & user testing', dueDate: daysFromNow(15), done: false },
        ],
        tasks: [
          { id: uid(), title: 'Write requirements doc', status: 'done', priority: 'high', assigneeId: aisha.id, dueDate: daysFromNow(-5) },
          { id: uid(), title: 'Design wireframes', status: 'done', priority: 'medium', assigneeId: chen.id, dueDate: daysFromNow(-2) },
          { id: uid(), title: 'Set up map component', status: 'doing', priority: 'high', assigneeId: ben.id, dueDate: daysFromNow(3) },
          { id: uid(), title: 'Bin data collection', status: 'doing', priority: 'medium', assigneeId: aisha.id, dueDate: daysFromNow(6) },
          { id: uid(), title: 'User testing session', status: 'todo', priority: 'medium', assigneeId: chen.id, dueDate: daysFromNow(14) },
          { id: uid(), title: 'Final presentation slides', status: 'todo', priority: 'low', assigneeId: null, dueDate: daysFromNow(19) },
        ],
      },
      {
        id: uid(),
        name: 'Renewable Energy Report',
        course: 'ENV 210 – Environmental Policy',
        description: 'Group research paper comparing solar adoption policies.',
        dueDate: daysFromNow(9),
        color: 'amber',
        createdBy: dana.id,
        memberIds: [dana.id, eli.id, aisha.id],
        responsibilities: [
          { id: uid(), studentId: dana.id, title: 'Research & literature review', dueDate: daysFromNow(3), done: false },
          { id: uid(), studentId: eli.id, title: 'Editing & formatting', dueDate: daysFromNow(8), done: false },
          { id: uid(), studentId: aisha.id, title: 'Data charts', dueDate: daysFromNow(6), done: false },
        ],
        tasks: [
          { id: uid(), title: 'Literature review', status: 'doing', priority: 'high', assigneeId: dana.id, dueDate: daysFromNow(2) },
          { id: uid(), title: 'Draft introduction', status: 'todo', priority: 'medium', assigneeId: dana.id, dueDate: daysFromNow(5) },
          { id: uid(), title: 'Solar adoption chart', status: 'todo', priority: 'medium', assigneeId: aisha.id, dueDate: daysFromNow(6) },
          { id: uid(), title: 'Citations & bibliography', status: 'todo', priority: 'low', assigneeId: eli.id, dueDate: daysFromNow(8) },
        ],
      },
    ],
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const data = raw && JSON.parse(raw)
    // Only trust saved data that has the current shape; otherwise start fresh.
    if (data && Array.isArray(data.students) && Array.isArray(data.projects)) return data
  } catch {
    /* ignore corrupt or blocked storage */
  }
  return seed()
}

const mapProject = (state, projectId, fn) => ({
  ...state,
  projects: state.projects.map((p) => (p.id === projectId ? fn(p) : p)),
})

function reducer(state, action) {
  switch (action.type) {
    case 'setCurrentStudent':
      return { ...state, currentStudentId: action.id }
    case 'addStudent':
      return { ...state, students: [...state.students, action.student] }
    case 'deleteStudent': {
      const students = state.students.filter((s) => s.id !== action.id)
      return {
        ...state,
        students,
        currentStudentId: state.currentStudentId === action.id ? (students[0]?.id ?? null) : state.currentStudentId,
        projects: state.projects.map((p) => ({
          ...p,
          memberIds: p.memberIds.filter((id) => id !== action.id),
          tasks: p.tasks.map((t) => (t.assigneeId === action.id ? { ...t, assigneeId: null } : t)),
          responsibilities: p.responsibilities.filter((r) => r.studentId !== action.id),
        })),
      }
    }

    case 'addProject':
      return { ...state, projects: [...state.projects, action.project] }
    case 'updateProject':
      return mapProject(state, action.id, (p) => ({ ...p, ...action.patch }))
    case 'deleteProject':
      return { ...state, projects: state.projects.filter((p) => p.id !== action.id) }

    case 'addMember':
      return mapProject(state, action.projectId, (p) =>
        p.memberIds.includes(action.studentId) ? p : { ...p, memberIds: [...p.memberIds, action.studentId] },
      )
    case 'removeMember':
      return mapProject(state, action.projectId, (p) => ({
        ...p,
        memberIds: p.memberIds.filter((id) => id !== action.studentId),
        tasks: p.tasks.map((t) => (t.assigneeId === action.studentId ? { ...t, assigneeId: null } : t)),
        responsibilities: p.responsibilities.filter((r) => r.studentId !== action.studentId),
      }))

    case 'addTask':
      return mapProject(state, action.projectId, (p) => ({ ...p, tasks: [...p.tasks, action.task] }))
    case 'updateTask':
      return mapProject(state, action.projectId, (p) => ({
        ...p,
        tasks: p.tasks.map((t) => (t.id === action.taskId ? { ...t, ...action.patch } : t)),
      }))
    case 'deleteTask':
      return mapProject(state, action.projectId, (p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== action.taskId) }))

    case 'addResponsibility':
      return mapProject(state, action.projectId, (p) => ({ ...p, responsibilities: [...p.responsibilities, action.responsibility] }))
    case 'updateResponsibility':
      return mapProject(state, action.projectId, (p) => ({
        ...p,
        responsibilities: p.responsibilities.map((r) => (r.id === action.id ? { ...r, ...action.patch } : r)),
      }))
    case 'deleteResponsibility':
      return mapProject(state, action.projectId, (p) => ({
        ...p,
        responsibilities: p.responsibilities.filter((r) => r.id !== action.id),
      }))

    case 'reset':
      return seed()
    default:
      return state
  }
}

export function useStore() {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable */
    }
  }, [state])
  return [state, dispatch]
}

export function progress(project) {
  if (!project.tasks.length) return 0
  return Math.round((project.tasks.filter((t) => t.status === 'done').length / project.tasks.length) * 100)
}

export function daysUntil(date) {
  if (!date) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((new Date(date + 'T00:00:00') - today) / 86400000)
}

export function dueLabel(date) {
  const n = daysUntil(date)
  if (n === null) return ''
  if (n < 0) return `${-n}d overdue`
  if (n === 0) return 'Due today'
  if (n === 1) return 'Due tomorrow'
  return `Due in ${n}d`
}

export const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('')
