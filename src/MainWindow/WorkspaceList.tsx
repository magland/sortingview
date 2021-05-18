import React, { useCallback, useMemo } from 'react'
import { FunctionComponent } from "react"
import { useBackendProviderClient, useTask } from '../python/sortingview/gui/labbox'
import useCurrentUserPermissions from '../python/sortingview/gui/labbox/backendProviders/useCurrentUserPermissions'
import { FeedId, isFeedId, sha1OfString, SubfeedHash } from '../python/sortingview/gui/labbox/kacheryTypes'
import useSubfeedReducer from '../python/sortingview/gui/labbox/misc/useSubfeedReducer'
import WorkspacesTable from './WorkspacesTable'

type Props = {
    onWorkspaceSelected: (workspaceUri: string) => void
}

// export type ExampleWorkspaceType = {
//     workspaceUri: string
//     workspaceLabel: string
// }
// const isExampleWorkspaceType = (x: any): x is ExampleWorkspaceType => {
//     return _validateObject(x, {
//         workspaceUri: isString,
//         workspaceLabel: isString
//     }, {allowAdditionalFields: true})
// }

// const isExampleWorkspaceTypeArray = (x: any): x is ExampleWorkspaceType[] => {
//     return isArrayOf(isExampleWorkspaceType)(x)
// }

const parseSubfeedUri = (subfeedUri: string | undefined): {feedId: FeedId | undefined, subfeedHash: SubfeedHash | undefined} => {
    const undefinedResult = {feedId: undefined, subfeedHash: undefined}
    if (!subfeedUri) return undefinedResult
    if (!subfeedUri.startsWith('feed://')) {
        return undefinedResult
    }
    const a = subfeedUri.split('/')
    const feedId = a[2] || undefined
    const subfeedPart = a[3] || undefined
    if ((!feedId) || (!subfeedPart)) return undefinedResult
    if (!isFeedId(feedId)) return undefinedResult
    const subfeedHash = (subfeedPart.startsWith('~') ? subfeedPart.slice(1) : sha1OfString(subfeedPart)) as any as SubfeedHash
    return {
        feedId,
        subfeedHash
    }
}

export type WorkspaceListWorkspace = {
    uri: string
    name: string
}

type WorkspaceListState = {
    workspaces: WorkspaceListWorkspace[]
}

type WorkspaceListAction = {
    type: 'add'
    workspace: WorkspaceListWorkspace
} | {
    type: 'remove'
    name: string
}

const workspaceListReducer = (s: WorkspaceListState, a: WorkspaceListAction) => {
    if (a.type === 'add') {
        if (s.workspaces.filter(w => (w.name === a.workspace.name))[0]) return s // already exists
        return {
            ...s,
            workspaces: [...s.workspaces, a.workspace]
        }
    }
    else if (a.type === 'remove') {
        return {
            ...s,
            workspaces: [...s.workspaces].filter(w => (w.name !== a.name))
        }
    }
    else {
        return s
    }
}

const WorkspaceList: FunctionComponent<Props> = ({onWorkspaceSelected}) => {
    const client = useBackendProviderClient()
    const {returnValue: workspaceListSubfeedUri, task} = useTask<string>(client?.backendUri ? 'workspace_list_subfeed.2' : '', {backend_uri: client?.backendUri, cachebust: '3'})
    const {feedId, subfeedHash} = parseSubfeedUri(workspaceListSubfeedUri)

    const currentUserPermissions = useCurrentUserPermissions()

    const readOnly = useMemo(() => {
        if (!currentUserPermissions) return true
        if (currentUserPermissions.appendToAllFeeds) return false
        if (((currentUserPermissions.feeds || {})[feedId?.toString() || ''] || {}).append) return false
        return true
    }, [currentUserPermissions, feedId])

    const [workspaces, workspacesDispatch] = useSubfeedReducer(feedId, subfeedHash, workspaceListReducer, {workspaces: []}, {actionField: true})
    
    const handleWorkspaceSelected = useCallback((w: WorkspaceListWorkspace) => {
        onWorkspaceSelected(w.uri)
    }, [onWorkspaceSelected])
    const handleDeleteWorkspace = useCallback((workspaceName: string) => {
        workspacesDispatch({
            type: 'remove',
            name: workspaceName
        })
    }, [workspacesDispatch])
    return (
        <div>
            {
                workspaces ? (
                    <WorkspacesTable
                        workspaces={workspaces.workspaces}
                        onWorkspaceSelected={handleWorkspaceSelected}
                        onDeleteWorkspace={readOnly ? undefined : handleDeleteWorkspace}
                    />
                ) : task?.status === 'error' ? (
                    <span>Error: {task.errorMessage}</span>
                ) :
                (
                    <span>Loading workspace list</span>
                )
            }
        </div>
    )
}

export default WorkspaceList