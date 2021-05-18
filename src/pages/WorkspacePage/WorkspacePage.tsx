import React, { useCallback, useMemo } from 'react'
import { FunctionComponent } from "react"
import workspaceReducer from '../../python/sortingview/gui/pluginInterface/workspaceReducer'
import { WorkspaceRoute, WorkspaceRouteAction, } from '../../python/sortingview/gui/pluginInterface/WorkspaceRoute'
import WorkspaceView from '../../python/sortingview/gui/extensions/workspaceview/WorkspaceView'
import { sha1OfString, SubfeedHash } from '../../python/sortingview/gui/labbox/kacheryTypes'
import { parseWorkspaceUri } from '../../python/sortingview/gui/labbox'
import { useBackendProviderClient } from '../../python/sortingview/gui/labbox'
import useRoute, { RoutePath } from '../../route/useRoute'
import useCurrentUserPermissions from '../../python/sortingview/gui/labbox/backendProviders/useCurrentUserPermissions'
import useSubfeedReducer from '../../python/sortingview/gui/labbox/misc/useSubfeedReducer'

type Props = {
    width: number
    height: number
}

const useWorkspace = (workspaceUri: string) => {
    const client = useBackendProviderClient()
    if (!client) throw Error('Unexpected: no backend provider client')
    const {feedId} = parseWorkspaceUri(workspaceUri)
    if (!feedId) throw Error(`Error parsing workspace URI: ${workspaceUri}`)

    const subfeedHash = sha1OfString('main') as any as SubfeedHash
    const [workspace, workspaceDispatch] = useSubfeedReducer(feedId, subfeedHash, workspaceReducer, {recordings: [], sortings: []}, {actionField: true})

    return {workspace, workspaceDispatch}
}

const WorkspacePage: FunctionComponent<Props> = ({width, height}) => {
    const {workspaceUri, routePath, setRoute} = useRoute()
    if (!workspaceUri) throw Error('Unexpected: workspaceUri is undefined')
    
    const {feedId} = parseWorkspaceUri(workspaceUri)
    const {workspace, workspaceDispatch} = useWorkspace(workspaceUri)
    // const [workspaceRoute, workspaceRouteDispatch] = useReducer(workspaceRouteReducer, {page: 'recordings', workspaceUri})

    const workspaceRoute = useMemo((): WorkspaceRoute => {
        if (routePath.startsWith('/workspace/recording/')) {
            return {
                page: 'recording',
                recordingId: routePath.split('/')[3],
                workspaceUri
            }
        }
        else if (routePath.startsWith('/workspace/sorting/')) {
            return {
                page: 'sorting',
                recordingId: routePath.split('/')[3],
                sortingId: routePath.split('/')[4],
                workspaceUri
            }
        }
        else {
            return {
                page: 'recordings',
                workspaceUri
            }
        }
    }, [workspaceUri, routePath])
    const workspaceRouteDispatch = useCallback((action: WorkspaceRouteAction) => {
        if (action.type === 'gotoRecordingPage') {
            setRoute({routePath: `/workspace/recording/${action.recordingId}` as RoutePath})
        }
        else if (action.type === 'gotoSortingPage') {
            setRoute({routePath: `/workspace/sorting/${action.recordingId}/${action.sortingId}` as RoutePath})
        }
        else if (action.type === 'gotoRecordingsPage') {
            setRoute({routePath: '/workspace'})
        }
    }, [setRoute])

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