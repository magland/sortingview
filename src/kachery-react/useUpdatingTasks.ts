import { Task, taskManager } from 'kachery-react/initiateTask';
import { useEffect, useState } from 'react';

const useUpdatingTasks = () : Task<any>[] => {
    const [tasks, setTasks] = useState<Task<any>[]>([])
    useEffect(() => {
        // this should only get called once
        const update = () => {
            const tasks = taskManager.allTasks()
            setTasks(tasks)
        }
        let updateScheduled = false
        const scheduleUpdate = () => {
            if (updateScheduled) return
            updateScheduled = true
            setTimeout(() => {
                updateScheduled = false
                update()
            }, 100)
        }
        update()
        taskManager.onUpdate(() => {
            scheduleUpdate()
        })
    }, [])
    return tasks
}

export default useUpdatingTasks