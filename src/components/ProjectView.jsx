import { useState } from 'react'
import { STATUSES, progress } from '../store'
import Board from './Board'
import TaskModal from './TaskModal'
import TeamPanel from './TeamPanel'
import { AvatarStack, COLOR_CLASSES, DueBadge, Icon, ProgressBar, btnDangerGhost, btnPrimary, btnSecondary, useConfirm } from './ui'

export default function ProjectView({ project, students, currentStudentId, dispatch, onEditProject, onDeleted }) {
  const [taskModal, setTaskModal] = useState(null) // { task?, status? }
  const [filter, setFilter] = useState('all')
  const confirm = useConfirm()
  const members = project.memberIds.map((id) => students.find((s) => s.id === id)).filter(Boolean)
  const creator = students.find((s) => s.id === project.createdBy)
  const pct = progress(project)
  const counts = Object.fromEntries(STATUSES.map((s) => [s.id, project.tasks.filter((t) => t.status === s.id).length]))

  const deleteProject = () =>
    confirm({
      title: 'Delete this project?',
      message: `“${project.name}” and all of its ${project.tasks.length} tasks and responsibilities will be permanently deleted. This can't be undone.`,
      confirmLabel: 'Delete project',
      onConfirm: () => {
        dispatch({ type: 'deleteProject', id: project.id })
        onDeleted()
      },
    })

  return (
    <div className="space-y-6">
      {project.completed && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
            <Icon name="checkCircle" className="h-5 w-5" /> This project is marked as completed. You can keep it for reference or delete it.
          </p>
          <button onClick={deleteProject} className="text-sm font-semibold text-rose-600 hover:underline">Delete project</button>
        </div>
      )}

      <div className={`overflow-hidden rounded-2xl border border-t-4 border-slate-200/80 bg-white shadow-sm ${COLOR_CLASSES[project.color].border}`}>
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLOR_CLASSES[project.color].soft}`}>
                {project.course || 'No course'}
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{project.name}</h1>
              {project.description && <p className="mt-1.5 max-w-2xl text-sm text-slate-600">{project.description}</p>}
              {creator && <p className="mt-2 text-xs text-slate-400">Created by <span className="font-semibold text-slate-600">{creator.name}</span></p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={onEditProject} className={btnSecondary}>
                <Icon name="pencil" /> Edit
              </button>
              <button
                onClick={() => dispatch({ type: 'updateProject', id: project.id, patch: { completed: !project.completed } })}
                className={btnSecondary}
              >
                <Icon name={project.completed ? 'undo' : 'checkCircle'} /> {project.completed ? 'Reopen' : 'Mark as completed'}
              </button>
              <button onClick={deleteProject} className={btnDangerGhost} title="Delete project">
                <Icon name="trash" /> Delete
              </button>
              <button onClick={() => setTaskModal({ status: 'todo' })} className={btnPrimary}>
                <Icon name="plus" /> Add task
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-4">
          <div className="bg-white px-6 py-4 sm:col-span-2">
            <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
              <span>Overall progress</span>
              <span className="font-bold text-slate-800">{pct}%</span>
            </div>
            <ProgressBar value={pct} color={project.color} />
            <div className="mt-2 flex gap-4 text-xs text-slate-500">
              <span><b className="text-slate-700">{counts.todo}</b> to do</span>
              <span><b className="text-sky-600">{counts.doing}</b> in progress</span>
              <span><b className="text-emerald-600">{counts.done}</b> done</span>
            </div>
          </div>
          <div className="bg-white px-6 py-4">
            <p className="mb-1.5 text-xs font-medium text-slate-500">Final deadline</p>
            {project.dueDate ? (
              <>
                <p className="text-sm font-bold text-slate-800">{project.dueDate}</p>
                <DueBadge date={project.dueDate} done={project.completed || pct === 100} />
              </>
            ) : (
              <p className="text-sm text-slate-400">Not set</p>
            )}
          </div>
          <div className="bg-white px-6 py-4">
            <p className="mb-1.5 text-xs font-medium text-slate-500">Team</p>
            {members.length ? <AvatarStack people={members} /> : <p className="text-sm text-slate-400">No members</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Filter</span>
            {[{ id: 'all', name: 'Everyone' }, ...members, { id: 'unassigned', name: 'Unassigned' }].map((m) => (
              <button
                key={m.id}
                onClick={() => setFilter(m.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${filter === m.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
              >
                {m.id === currentStudentId ? `${m.name} (you)` : m.name}
              </button>
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
            setTaskModal(null)
          }}
          onDelete={() => {
            dispatch({ type: 'deleteTask', projectId: project.id, taskId: taskModal.task.id })
            setTaskModal(null)
          }}
        />
      )}
    </div>
  )
}
