import { useEffect, useMemo, useState } from 'react'
import { JSONStringifyDeterministic } from '../../kacheryTypes'
import { useBackendProviderClient } from '../useBackendProviders'
import Task, { TaskStatus } from './Task'

const useTask = <ReturnType>(functionId: string, kwargs: any) => {
    const client = useBackendProviderClient()
    const [taskStatus, setTaskStatus] = useState<TaskStatus>('waiting')
    const [task, setTask] = useState<Task<ReturnType> | undefined>(undefined)

    const stringifiedKwargs = JSONStringifyDeterministic(kwargs) // important to do it like this so that we don't call this effect more than once
    useEffect(() => {
        if (!client) return
        const restoredKwargs = JSON.parse(stringifiedKwargs)
        const t = client.initiateTask<ReturnType>(functionId, restoredKwargs)
        setTask(t)
    }, [functionId, stringifiedKwargs, client]) as any as (Task<ReturnType> | undefined)

    useEffect(() => {
        if (!task) return
        task.onStatusChanged((s: TaskStatus) => {
            setTaskStatus(task.status)
        })
        setTaskStatus(task.status)
        const cleanup = () => {
            task.decrementNumPointers()
        }
        return cleanup
    }, [task])

    return useMemo(() => {
        const returnValue = task ? (
            (taskStatus === 'finished') && (task.status === 'finished') ? (
                task.returnValue as any as ReturnType
            ) : undefined
        ) : undefined
    
        return {returnValue, task}
    }, [task, taskStatus])
}

export default useTask