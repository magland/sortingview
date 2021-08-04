import useWorkspace from 'labbox-react/workspace/useWorkspace'
import WorkspaceNavigationComponent from 'python/sortingview/gui/WorkspacePage/WorkspaceNavigationComponent/WorkspaceNavigationComponent'
import React, { FunctionComponent } from 'react'
import WorkspaceView from '../extensions/workspaceview/WorkspaceView'
import { initialWorkspaceState, WorkspaceAction, workspaceReducer, WorkspaceState } from '../pluginInterface/workspaceReducer'
import useWorkspaceRoute from './useWorkspaceRoute'
type Props = {
    width: number
    height: number
    workspaceUri?: string
}

export const useSortingViewWorkspace = (workspaceUri: string) => {
    return useWorkspace<WorkspaceState, WorkspaceAction>({
        workspaceUri,
        workspaceReducer,
        initialWorkspaceState,
        actionField: true,
        actionFunctionId: 'sortingview_workspace_action.1'
    })
}

const workspaceNavigationHeight = 30
const horizontalPadding = 10
const paddingTop = 5
const divStyle: React.CSSProperties = {
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    paddingTop: paddingTop
}


const WorkspacePage: FunctionComponent<Props> = ({width, height, workspaceUri}) => {
    if (!workspaceUri) throw Error('Unexpected: workspaceUri is undefined')
    
    // const {feedId} = parseWorkspaceUri(workspaceUri)
    const {workspace, workspaceDispatch} = useSortingViewWorkspace(workspaceUri)
    const {workspaceRoute, workspaceRouteDispatch} = useWorkspaceRoute()

    return (
        <div className="WorkspacePage" style={divStyle}>
            <WorkspaceNavigationComponent
                workspace={workspace}
                workspaceRoute={workspaceRoute}
                workspaceRouteDispatch={workspaceRouteDispatch}
                height={workspaceNavigationHeight}
            />
            <WorkspaceView
                workspace={workspace}
                workspaceDispatch={workspaceDispatch}
                workspaceRoute={workspaceRoute}
                workspaceRouteDispatch={workspaceRouteDispatch}
                width={width - horizontalPadding * 2}
                height={height - workspaceNavigationHeight - paddingTop}
            />
        </div>
    )
}

export default WorkspacePage