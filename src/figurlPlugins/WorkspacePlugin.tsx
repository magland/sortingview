import { FigurlPlugin } from "figurl/types";
import { isString, _validateObject } from "kachery-js/types/kacheryTypes";
import WorkspaceView from 'python/sortingview/gui/extensions/workspaceview/WorkspaceView';
import { WorkspaceRoute } from 'python/sortingview/gui/pluginInterface';
import { workspaceRouteReducer } from "python/sortingview/gui/pluginInterface/WorkspaceRoute";
import { useSortingViewWorkspace } from 'python/sortingview/gui/WorkspacePage/WorkspacePage';
import React, { FunctionComponent, useMemo, useReducer } from 'react';


type WorkspaceData = {
    workspaceUri: string,
}
const isWorkspaceData = (x: any): x is WorkspaceData => {
    return _validateObject(x, {
        workspaceUri: isString
    })
}

type Props = {
    data: WorkspaceData
    width: number
    height: number
}

const workspaceNavigationHeight = 10
const horizontalPadding = 20
const paddingTop = 5
const divStyle: React.CSSProperties = {
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    paddingTop: paddingTop
}

const useWorkspaceRoute2 = (workspaceUri: string) => {
    const initialState: WorkspaceRoute = useMemo(() => {
        return {page: 'workspace', workspaceUri}
    }, [workspaceUri])
    const [workspaceRoute, workspaceRouteDispatch] = useReducer(workspaceRouteReducer, initialState)
    return {workspaceRoute, workspaceRouteDispatch}
}

const WorkspaceComponent: FunctionComponent<Props> = ({data, width, height}) => {
    const {workspaceUri} = data

    const {workspace, workspaceDispatch} = useSortingViewWorkspace(workspaceUri)
    const {workspaceRoute, workspaceRouteDispatch} = useWorkspaceRoute2(workspaceUri)

    return (
        <div className="WorkspacePage" style={divStyle}>
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

const WorkspacePlugin: FigurlPlugin = {
    type: 'sortingview.workspace.1',
    validateData: isWorkspaceData,
    component: WorkspaceComponent
}

export default WorkspacePlugin