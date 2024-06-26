import { FormEvent, useEffect, useState } from "react"
import { remult } from "remult"
import { Task } from "./shared/Task"
import { TasksController } from "./shared/TasksController"

const taskRepo = remult.repo(Task)

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")

  const addTask = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await taskRepo.insert({ title: newTaskTitle, userTask: remult.user?.name })
      setNewTaskTitle("")
    } catch (error) {
      alert((error as { message: string }).message)
    }
  }
  const setAllCompleted = async (completed: boolean) => {
    await TasksController.setAllCompleted(completed)
  }
  useEffect(() => {
    return taskRepo
      .liveQuery({
        limit: 20,
        orderBy: { createdAt: "asc" },
        //where: { completed: true },
      })
      .subscribe((info) => setTasks(info.applyChanges))
  }, [])
  return (
    <div>
      <h1>Todos</h1>
      <main>
        {taskRepo.metadata.apiInsertAllowed() && (
          <form onSubmit={addTask}>
            <input
              value={newTaskTitle}
              placeholder="What needs to be done?"
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <button>Add</button>
          </form>
        )}
        {tasks.map((task) => {
          const setTask = (value: Task) =>
            setTasks((tasks) => tasks.map((t) => (t === task ? value : t)))

          const setCompleted = async (completed: boolean) =>
            await taskRepo.save({ ...task, completed, userCompleted: completed ? remult.user?.name : ""})

          const setTitle = (title: string) => setTask({ ...task, title })

          const saveTask = async () => {
            try {
              await taskRepo.save(task)
            } catch (error) {
              alert((error as { message: string }).message)
            }
          }
          const deleteTask = async () => {
            try {
              await taskRepo.delete(task)
              setTasks(tasks.filter((t) => t !== task))
            } catch (error) {
              alert((error as { message: string }).message)
            }
          }

          return (
            <div key={task.id}>
              <h5>Created: {task.userTask}</h5>
              <div className="datatime">{task.createdAt.toLocaleDateString()}</div>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
              
              <input
                value={task.title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <button onClick={saveTask}>Save</button>
              {taskRepo.metadata.apiDeleteAllowed(task) && (
                <button onClick={deleteTask}>Delete</button>
              )}
              <h5>complet: {task.userCompleted}</h5>
            </div>
          )
        })}

        <div>
          <button onClick={() => setAllCompleted(true)}>
            Set All Completed
          </button>
          <button onClick={() => setAllCompleted(false)}>
            Set All Uncompleted
          </button>
        </div>
      </main>
    </div>
  )
}
