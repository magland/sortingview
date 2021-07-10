import { FeedId, sha1OfString, SubfeedHash, TaskFunctionId } from "kachery-js/types/kacheryTypes"
import { initiateTask, useChannel, useKacheryNode, useSubfeedReducer } from "kachery-react"
import useGoogleSignInClient from "labbox-react/googleSignIn/useGoogleSignInClient"
import { useCallback } from "react"

export interface BaseWorkspaceState {
    userPermissions: {
        [key: string]: {
            edit?: boolean
        }
    }
}

export const useCurrentUserWorkspacePermissions = (workspace: BaseWorkspaceState) => {
    const signInClient = useGoogleSignInClient()
    if (!signInClient) return {}
    const userId = signInClient.userId
    if (!userId) return {}
    const p = workspace.userPermissions[userId]
    if (!p) return {}
    return p
}

type Args<WorkspaceState, WorkspaceAction> = {
    workspaceUri: string,
    workspaceReducer: (s: WorkspaceState, a: WorkspaceAction) => WorkspaceState,
    initialWorkspaceState: WorkspaceState
    actionField: boolean
    actionFunctionId: TaskFunctionId | string
}

const useWorkspace = <WorkspaceState extends BaseWorkspaceState, WorkspaceAction>(args: Args<WorkspaceState, WorkspaceAction>) => {
    const {workspaceUri, workspaceReducer, initialWorkspaceState, actionField, actionFunctionId} = args
    const {feedId} = parseWorkspaceUri(workspaceUri)
    if (!feedId) throw Error(`Error parsing workspace URI: ${workspaceUri}`)

    const subfeedHash = sha1OfString('main') as any as SubfeedHash
    const {state: workspace} = useSubfeedReducer(feedId, subfeedHash, workspaceReducer, initialWorkspaceState, {actionField})
    const userWorkspacePermissions = useCurrentUserWorkspacePermissions(workspace)
    const readOnly = userWorkspacePermissions.edit ? false : true
    const kacheryNode = useKacheryNode()
    const {channelName} = useChannel()
    const workspaceDispatch = useCallback((a: WorkspaceAction) => {
        initiateTask({
            kacheryNode,
            channelName,
            functionId: actionFunctionId,
            kwargs: {
                workspace_uri: workspaceUri,
                action: a
            },
            functionType: 'action',
            onStatusChanged: () => {}
        })
    }, [kacheryNode, channelName, workspaceUri, actionFunctionId])

    const workspaceDispatch2 = readOnly ? undefined : workspaceDispatch

    return {workspace, workspaceDispatch: workspaceDispatch2}
}

export const parseWorkspaceUri = (workspaceUri: string | undefined): {feedId: FeedId | undefined, feedUri: string | undefined} => {
    if (!workspaceUri) return {feedUri: undefined, feedId: undefined}
    if (!workspaceUri.startsWith('workspace://')) {
        return {feedUri: undefined, feedId: undefined}
    }
    const a = workspaceUri.split('?')[0].split('/')
    const feedId = a[2] || undefined
    if (!feedId) return {feedUri: undefined, feedId: undefined}
    return {
        feedId: feedId as any as FeedId,
        feedUri: `feed://${feedId}`
    }
}

export default useWorkspace