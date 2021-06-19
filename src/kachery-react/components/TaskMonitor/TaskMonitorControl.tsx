import useUpdatingTasks from 'kachery-react/useUpdatingTasks';
import React, { FunctionComponent, useMemo } from 'react';
import Hyperlink from 'labbox-react/components/Hyperlink/Hyperlink'

type Props = {
    onOpen: () => void
    color: string
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