import React, { FunctionComponent, useMemo } from 'react';
import Hyperlink from '../../../commonComponents/Hyperlink/Hyperlink';
import { Task } from 'kachery-react/initiateTask';

type Props = {
    onOpen: () => void
    color: string
}

export const useUpdatingTasks = () : Task<any>[] => {
    // const [tasks, setTasks] = useState<Task<any>[]>([])
    // const client = useChannels().selectedChannelClient
    // useEffect(() => {
    //     if (!client) return
    //     // this should only get called once
    //     // (hither should not change, but if it does we might have a problem here)
    //     const timer1 = setInterval(() => {
    //         const tasks = client.allTasks
    //         setTasks(tasks)
    //     }, 2000)
    //     return () => {
    //         clearInterval(timer1)
    //     }
    // }, [client])
    // return tasks
    return []
}

const TaskMonitorControl: FunctionComponent<Props> = ({ onOpen, color }) => {
    const tasks = useUpdatingTasks()
    const { pendingTasks, runningTasks, finishedTasks, erroredTasks } = useMemo(() => ({
        pendingTasks: tasks.filter(j => (j.status === 'pending')),
        runningTasks: tasks.filter(j => (j.status === 'running')),
        finishedTasks: tasks.filter(j => (j.status === 'finished')),
        erroredTasks: tasks.filter(j => (j.status === 'error')),
    }), [tasks])
    const numPending = pendingTasks.length;
    const numRunning = runningTasks.length;
    const numFinished = finishedTasks.length;
    const numErrored = erroredTasks.length;
    const title = `Tasks: ${numPending} pending | ${numRunning} running | ${numFinished} finished | ${numErrored} errored`
    const errored = numErrored > 0 ? (
        <span>:<span style={{color: 'pink'}}>{numErrored}</span></span>
    ) : <span></span>
    return (
        <Hyperlink onClick={onOpen}>
            <span style={{ fontFamily: "courier", color }} title={title}>{numPending}:{numRunning}:{numFinished}{errored}</span>
        </Hyperlink>
    );
}

export default TaskMonitorControl