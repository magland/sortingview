import React, { FunctionComponent, useCallback } from 'react'
import { WorkspaceRoute, WorkspaceRouteDispatch } from '../../pluginInterface'
import { WorkspaceState } from '../../pluginInterface/workspaceReducer'
import './WorkspaceNavigationComponent.css'

type Props = {
    workspace: WorkspaceState
    workspaceRoute: WorkspaceRoute
    workspaceRouteDispatch: WorkspaceRouteDispatch
    height: number
}

const WorkspaceNavigationComponent: FunctionComponent<Props> = (props) => {
    const {height} = props
    return (
        <div style={{height}}>
            <WorkspacePart {...props} />
            <RecordingPart {...props} />
            <SortingPart {...props} />
        </div>
    )
}

const WorkspacePart: FunctionComponent<Props> = ({workspaceRoute, workspaceRouteDispatch}) => {
    const {workspaceUri} = workspaceRoute
    const handleClick = useCallback(() => {
        workspaceRouteDispatch({
            type: 'gotoWorkspacePage'
        })
    }, [workspaceRouteDispatch])
    return (
        workspaceUri ? (
            <Part label={shorten(workspaceUri, 20)} title="Go to workspace home" onClick={handleClick} />
        ) : <span />
    )
}

const RecordingPart: FunctionComponent<Props> = ({workspace, workspaceRoute, workspaceRouteDispatch}) => {
    const handleClick = useCallback(() => {
        if ((workspaceRoute.page !== 'recording') && (workspaceRoute.page !== 'sorting') && (workspaceRoute.page !== 'sortingComparison')) throw Error('Unexpected')
        workspaceRouteDispatch({
            type: 'gotoRecordingPage',
            recordingId: workspaceRoute.recordingId
        })
    }, [workspaceRouteDispatch, workspaceRoute])
    if ((workspaceRoute.page === 'recording') || (workspaceRoute.page === 'sorting') || (workspaceRoute.page === 'sortingComparison')) {
        const rid = workspaceRoute.recordingId
        const recording = workspace.recordings.filter(r => (r.recordingId === rid))[0]
        if (recording) {
            return <Part label={recording.recordingLabel} title="Go to recording page" onClick={handleClick} />
        }
        else return <Part label="Unknown recording" title="" onClick={handleClick} />
    }
    else return <span />
}

const SortingPart: FunctionComponent<Props> = ({workspace, workspaceRoute, workspaceRouteDispatch}) => {
    const handleClick = useCallback(() => {
        if (workspaceRoute.page !== 'sorting') throw Error('Unexpected')
        workspaceRouteDispatch({
            type: 'gotoSortingPage',
            recordingId: workspaceRoute.recordingId,
            sortingId: workspaceRoute.sortingId
        })
    }, [workspaceRouteDispatch, workspaceRoute])
    if (workspaceRoute.page === 'sorting') {
        const sid = workspaceRoute.sortingId
        if (sid === '-') return <Part label="No sorting" title="" onClick={handleClick} />
        const sorting = workspace.sortings.filter(s => (s.sortingId === sid))[0]
        if (sorting) {
            return <Part label={sorting.sortingLabel} title="Go to sorting page" onClick={handleClick} />
        }
        else return <span>Unknown sorting {sid}</span>
    }
    else if (workspaceRoute.page === 'sortingComparison') {
        const sid1 = workspaceRoute.sortingId1
        const sid2 = workspaceRoute.sortingId2
        const sorting1 = workspace.sortings.filter(s => (s.sortingId === sid1))[0]
        const sorting2 = workspace.sortings.filter(s => (s.sortingId === sid2))[0]
        if (!sorting1) {
            return <span>Unknown sorting {sid1}</span>
        }
        if (!sorting2) {
            return <span>Unknown sorting {sid2}</span>
        }
        return <Part label={`${sorting1.sortingLabel}/${sorting2.sortingLabel}`} title="Go to sorting comparison page" onClick={handleClick} />
    }
    else return <span />
}

const Part: FunctionComponent<{label: string, title: string, onClick: () => void}> = ({label, title, onClick}) => {
    return (
        <span
            className="WorkspaceNavigationPart"
            title={title}
            onClick={onClick}
        >
            {label}
        </span>
    )
}

const shorten = (x: string, maxLength: number) => {
    if (x.length <= maxLength) return x
    else return `${x.slice(0, maxLength - 3)}...`
}

export default WorkspaceNavigationComponent