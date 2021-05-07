import { useEffect, useMemo, useState } from 'react'
import useBackendProviders from '../useBackendProviders'
import { TaskStatus } from './Task'


const useBackendProviderClient = () => {
    return useBackendProviders().selectedBackendProviderClient
}

const useTask = <ReturnType>(functionId: string, kwargs: any) => {
    const client = useBackendProviderClient()
    const [taskStatus, setTaskStatus] = useState<TaskStatus>('waiting')
    const task = useMemo(() => {
        if (!client) return undefined
        return client.initiateTask(functionId, kwargs)
    }, [functionId, kwargs, client])
    useEffect(() => {
        if (!task) return
        task.onStatusChanged((s) => {
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