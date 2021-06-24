import { sha1OfString, SubfeedHash } from 'kachery-js/types/kacheryTypes'
import { initiateTask, useChannel, useKacheryNode } from 'kachery-react'
import useSubfeedReducer from 'kachery-react/useSubfeedReducer'
import { parseWorkspaceUri, useGoogleSignInClient } from 'labbox-react'
import React, { FunctionComponent, useCallback } from 'react'
import WorkspaceView from '../../extensions/workspaceview/WorkspaceView'
import workspaceReducer, { initialWorkspaceState, WorkspaceAction, WorkspaceState } from '../../pluginInterface/workspaceReducer'
import useRoute from '../../route/useRoute'
import useWorkspaceRoute from './useWorkspaceRoute'
import WorkspaceNavigationComponent from './WorkspaceNavigationComponent'
type Props = {
    width: number
    height: number
}

export const useCurrentUserWorkspacePermissions = (workspace: WorkspaceState) => {
    const signInClient = useGoogleSignInClient()
    if (!signInClient) return {}
    const userId = signInClient.userId
    if (!userId) return {}
    const p = workspace.userPermissions[userId]
    if (!p) return {}
    return p
}

const useWorkspace = (workspaceUri: string) => {
    const {feedId} = parseWorkspaceUri(workspaceUri)
    if (!feedId) throw Error(`Error parsing workspace URI: ${workspaceUri}`)

    const subfeedHash = sha1OfString('main') as any as SubfeedHash
    const {state: workspace} = useSubfeedReducer(feedId, subfeedHash, workspaceReducer, initialWorkspaceState, {actionField: true})
    const userWorkspacePermissions = useCurrentUserWorkspacePermissions(workspace)
    const readOnly = userWorkspacePermissions.edit ? false : true
    const kacheryNode = useKacheryNode()
    const {channelName} = useChannel()
    const workspaceDispatch = useCallback((a: WorkspaceAction) => {
        initiateTask({
            kacheryNode,
            channelName,
            functionId: 'workspace_action.1',
            kwargs: {
                workspace_uri: workspaceUri,
                action: a
            },
            functionType: 'action',
            onStatusChanged: () => {}
        })
    }, [kacheryNode, channelName, workspaceUri])

    const workspaceDispatch2 = readOnly ? undefined : workspaceDispatch

    return {workspace, workspaceDispatch: workspaceDispatch2}
}

const workspaceNavigationHeight = 30
const horizontalPadding = 10
const paddingTop = 5
const divStyle: React.CSSProperties = {
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    paddingTop: paddingTop
}


const WorkspacePage: FunctionComponent<Props> = ({width, height}) => {
    const {workspaceUri} = useRoute()
    if (!workspaceUri) throw Error('Unexpected: workspaceUri is undefined')
    
    // const {feedId} = parseWorkspaceUri(workspaceUri)
    const {workspace, workspaceDispatch} = useWorkspace(workspaceUri)
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