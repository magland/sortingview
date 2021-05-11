import { useEffect, useMemo, useState } from 'react'
import { useBackendProviderClient } from '../useBackendProviders'
import Task, { TaskStatus } from './Task'

const useTask = <ReturnType>(functionId: string, kwargs: any) => {
    const client = useBackendProviderClient()
    const [taskStatus, setTaskStatus] = useState<TaskStatus>('waiting')
    const task = useMemo(() => {
        if (!client) return undefined
        return client.initiateTask<ReturnType>(functionId, kwargs)
    }, [functionId, kwargs, client]) as any as (Task<ReturnType> | undefined)
    useEffect(() => {
        if (!task) return
        task.onStatusChanged((s: TaskStatus) => {
            setTaskStatus(task.status)
        })
        setTaskStatus(task.status)
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