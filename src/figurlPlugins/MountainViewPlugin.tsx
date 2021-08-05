import { FigurlPlugin } from "figurl/types";
import { isString, _validateObject } from "kachery-js/types/kacheryTypes";
import { useChannel } from 'figurl/kachery-react';
import WorkspaceView from 'python/sortingview/gui/extensions/workspaceview/WorkspaceView';
import { WorkspaceRoute } from 'python/sortingview/gui/pluginInterface';
import { useSortingViewWorkspace } from 'python/sortingview/gui/WorkspacePage/WorkspacePage';
import React, { FunctionComponent, useMemo } from 'react';


type MountainViewData = {
    workspaceUri: string,
    recordingId: string,
    sortingId: string
}
const isMountainViewData = (x: any): x is MountainViewData => {
    return _validateObject(x, {
        workspaceUri: isString,
        recordingId: isString,
        sortingId: isString
    })
}

type Props = {
    data: MountainViewData
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

const MountainViewComponent: FunctionComponent<Props> = ({data, width, height}) => {
    const {workspaceUri, recordingId, sortingId} = data

    const {workspace, workspaceDispatch} = useSortingViewWorkspace(workspaceUri)
    const {channelName} = useChannel()
    const {workspaceRoute, workspaceRouteDispatch} = useMemo(() => {
        const r: WorkspaceRoute = {
            page: 'sorting',
            recordingId,
            sortingId,
            workspaceUri,
            channelName
        }
        return {
            workspaceRoute: r,
            workspaceRouteDispatch: () => {}
        }
    }, [workspaceUri, recordingId, sortingId, channelName])

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

const MountainViewPlugin: FigurlPlugin = {
    type: 'sortingview.mountainview.1',
    validateData: isMountainViewData,
    component: MountainViewComponent
}

export default MountainViewPlugin