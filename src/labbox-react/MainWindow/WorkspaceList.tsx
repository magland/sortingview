import { FeedId, isFeedId, sha1OfString, SubfeedHash } from 'kachery-js/types/kacheryTypes'
import useQueryTask from 'kachery-react/useQueryTask'
import useSubfeedReducer from 'kachery-react/useSubfeedReducer'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import useChannel from 'kachery-react/useChannel'
import useCurrentUserPermissions from '../workspace/useCurrentUserPermissions'
import WorkspacesTable from './WorkspacesTable'

type Props = {
    packageName: string
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

const WorkspaceList: FunctionComponent<Props> = ({onWorkspaceSelected, packageName}) => {
    const {channelName} = useChannel()
    const {returnValue: workspaceListSubfeedUri, task} = useQueryTask<string>(channelName ? `${packageName}_workspace_list_subfeed.2` : '', {name: 'default'}, {useCache: true, channelName})
    const {feedId, subfeedHash} = parseSubfeedUri(workspaceListSubfeedUri)

    const currentUserPermissions = useCurrentUserPermissions()

    const readOnly = useMemo(() => {
        if (!currentUserPermissions) return true
        if (currentUserPermissions.appendToAllFeeds) return false
        if (((currentUserPermissions.feeds || {})[feedId?.toString() || ''] || {}).append) return false
        return true
    }, [currentUserPermissions, feedId])

    const {state: workspaces} = useSubfeedReducer(feedId, subfeedHash, workspaceListReducer, {workspaces: []}, {actionField: true})
    const workspacesDispatch: ((a: WorkspaceListAction) => void) | undefined = useMemo(() => (
        readOnly ? undefined : (a: WorkspaceListAction) => {}
    ), [readOnly])
    
    const handleWorkspaceSelected = useCallback((w: WorkspaceListWorkspace) => {
        onWorkspaceSelected(w.uri)
    }, [onWorkspaceSelected])
    const handleDeleteWorkspace = useCallback((workspaceName: string) => {
        workspacesDispatch && workspacesDispatch({
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