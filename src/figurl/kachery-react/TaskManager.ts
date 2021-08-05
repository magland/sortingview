import { GarbageMap } from "kachery-js"
import { TaskId } from "kachery-js/types/kacheryTypes"
import { Task } from "./initiateTask"

class TaskManager {
    #tasks = new GarbageMap<TaskId, Task<any>>(null)
    #updateCallbacks: (() => void)[] = []
    addTask(task: Task<any>) {
        this.#tasks.set(task.taskId, task)
        this.#updateCallbacks.forEach(cb => cb())
        task.onStatusUpdate(() => {
            this.#updateCallbacks.forEach(cb => cb())
        })
    }
    getTask(taskId: TaskId) {
        return this.#tasks.get(taskId)
    }
    allTasks() {
        return this.#tasks.values()
    }
    onUpdate(cb: () => void) {
        this.#updateCallbacks.push(cb)
    }
}

export default TaskManager