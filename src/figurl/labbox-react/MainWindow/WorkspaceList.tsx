import useChannel from 'figurl/kachery-react/useChannel'
import useQueryTask from 'figurl/kachery-react/useQueryTask'
import useGoogleSignInClient from '../googleSignIn/useGoogleSignInClient'
import React, { FunctionComponent, useCallback } from 'react'
import WorkspacesTable from './WorkspacesTable'

type Props = {
    packageName: string
    onWorkspaceSelected: (workspaceUri: string) => void
}

export type WorkspaceListWorkspace = {
    workspaceUri: string
    label: string
    metaData: any
}

const WorkspaceList: FunctionComponent<Props> = ({onWorkspaceSelected, packageName}) => {
    const {channelName} = useChannel()
    const client = useGoogleSignInClient()

    // This is the newer system for getting the workspace list
    const {returnValue: workspaceList, task} = useQueryTask<WorkspaceListWorkspace[]>(
        channelName ? `sortingview.get_workspace_list.1` : undefined,
        {
            name: 'default',
            id_token: client ? client.idToken : undefined
        }, {
            fallbackToCache: true,
            channelName
        }
    )
    
    const handleWorkspaceSelected = useCallback((w: WorkspaceListWorkspace) => {
        onWorkspaceSelected(w.workspaceUri)
    }, [onWorkspaceSelected])
    
    return (
        <div>
            {
                workspaceList ? (
                    <WorkspacesTable
                        workspaceList={workspaceList}
                        onWorkspaceSelected={handleWorkspaceSelected}
                        // onDeleteWorkspace={readOnly ? undefined : handleDeleteWorkspace}
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