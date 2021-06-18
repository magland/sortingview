import { sha1OfString, SubfeedHash } from 'kachery-js/types/kacheryTypes'
import useSubfeedReducer from 'kachery-react/useSubfeedReducer'
import React, { FunctionComponent, useMemo } from 'react'
import WorkspaceView from '../../extensions/workspaceview/WorkspaceView'
import { parseWorkspaceUri } from '../../labbox'
import workspaceReducer, { WorkspaceAction } from '../../pluginInterface/workspaceReducer'
import useRoute from '../../route/useRoute'
import useCurrentUserPermissions from './useCurrentUserPermissions'
import useWorkspaceRoute from './useWorkspaceRoute'
type Props = {
    width: number
    height: number
}

const useWorkspace = (workspaceUri: string) => {
    const {feedId} = parseWorkspaceUri(workspaceUri)
    if (!feedId) throw Error(`Error parsing workspace URI: ${workspaceUri}`)

    const subfeedHash = sha1OfString('main') as any as SubfeedHash
    const {state: workspace} = useSubfeedReducer(feedId, subfeedHash, workspaceReducer, {recordings: [], sortings: []}, {actionField: true})
    const readOnly = true
    const workspaceDispatch: ((a: WorkspaceAction) => void) | undefined = useMemo(() => (
        readOnly ? undefined : (a: WorkspaceAction) => {}
    ), [readOnly])

    return {workspace, workspaceDispatch}
}

const WorkspacePage: FunctionComponent<Props> = ({width, height}) => {
    const {workspaceUri} = useRoute()
    if (!workspaceUri) throw Error('Unexpected: workspaceUri is undefined')
    
    const {feedId} = parseWorkspaceUri(workspaceUri)
    const {workspace, workspaceDispatch} = useWorkspace(workspaceUri)
    const {workspaceRoute, workspaceRouteDispatch} = useWorkspaceRoute()

    // const workspaceRoute = useMemo((): WorkspaceRoute => {
    //     if (routePath.startsWith('/workspace/recording/')) {
    //         return {
    //             page: 'recording',
    //             recordingId: routePath.split('/')[3],
    //             workspaceUri
    //         }
    //     }
    //     else if (routePath.startsWith('/workspace/sorting/')) {
    //         return {
    //             page: 'sorting',
    //             recordingId: routePath.split('/')[3],
    //             sortingId: routePath.split('/')[4],
    //             workspaceUri
    //         }
    //     }
    //     else {
    //         return {
    //             page: 'recordings',
    //             workspaceUri
    //         }
    //     }
    // }, [workspaceUri, routePath])
    // const workspaceRouteDispatch = useCallback((action: WorkspaceRouteAction) => {
    //     if (action.type === 'gotoRecordingPage') {
    //         setRoute({routePath: `/workspace/recording/${action.recordingId}` as RoutePath})
    //     }
    //     else if (action.type === 'gotoSortingPage') {
    //         setRoute({routePath: `/workspace/sorting/${action.recordingId}/${action.sortingId}` as RoutePath})
    //     }
    //     else if (action.type === 'gotoRecordingsPage') {
    //         setRoute({routePath: '/workspace'})
    //     }
    // }, [setRoute])

    const currentUserPermissions = useCurrentUserPermissions()


    const readOnly = useMemo(() => {
        if (!currentUserPermissions) return true
        if (currentUserPermissions.appendToAllFeeds) return false
        if (((currentUserPermissions.feeds || {})[feedId?.toString() || ''] || {}).append) return false
        return true
    }, [currentUserPermissions, feedId])
    const workspaceDispatch2 = readOnly ? undefined : workspaceDispatch

    return (
        <WorkspaceView
            workspace={workspace}
            workspaceDispatch={workspaceDispatch2}
            workspaceRoute={workspaceRoute}
            workspaceRouteDispatch={workspaceRouteDispatch}
            width={width}
            height={height}
        />
    )
}

export default WorkspacePage