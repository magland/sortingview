import React, { useCallback, useEffect, useMemo, useReducer } from 'react'
import { FunctionComponent } from "react"
import workspaceReducer, { WorkspaceAction } from '../../python/sortingview/extensions/pluginInterface/workspaceReducer'
import { WorkspaceRoute, WorkspaceRouteAction, } from '../../python/sortingview/extensions/pluginInterface/WorkspaceRoute'
import WorkspaceView from '../../python/sortingview/extensions/workspaceview/WorkspaceView'
import { sha1OfObject, SubfeedHash, SubfeedMessage } from '../../reusable/backendProviders/kacheryTypes/kacheryTypes'
import { parseWorkspaceUri } from '../../reusable/backendProviders/misc'
import { useBackendProviderClient } from '../../reusable/backendProviders/useBackendProviders'
import useRoute, { RoutePath } from '../../route/useRoute'

type Props = {
    width: number
    height: number
}

const useWorkspace = (workspaceUri: string) => {
    const client = useBackendProviderClient()
    if (!client) throw Error('Unexpected: no backend provider client')
    const {feedId, workspaceName} = parseWorkspaceUri(workspaceUri)
    if ((!feedId) || (!workspaceName)) throw Error(`Error parsing workspace URI: ${workspaceUri}`)
    const [workspace, workspaceDispatch] = useReducer(workspaceReducer, {recordings: [], sortings: []})
    // const workspace = useMemo(() => {
    //     const W = new Workspace(client, feedId, workspaceName)
    //     return W
    // }, [client, feedId, workspaceName])
    useEffect(() => {
        const subfeedHash = sha1OfObject({workspaceName}) as any as SubfeedHash
        const subscription = client.subscribeToSubfeed({feedId: feedId, subfeedHash, startPosition: 0, onMessage: (msg: SubfeedMessage) => {
            const action = msg.action
            if (action) {
                workspaceDispatch(action as WorkspaceAction)
            }
        }})
        return () => {
            subscription.cancel()
        }
    }, [client, feedId, workspaceName])
    return {workspace, workspaceDispatch}
}

const WorkspacePage: FunctionComponent<Props> = ({width, height}) => {
    const {workspaceUri, routePath, setRoute} = useRoute()
    if (!workspaceUri) throw Error('Unexpected: workspaceUri is undefined')
    
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

    const readOnly = true
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