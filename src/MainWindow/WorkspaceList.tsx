import React, { useCallback } from 'react'
import { FunctionComponent } from "react"
import useTask from '../reusable/backendProviders/tasks/useTask'
import ExampleWorkspacesTable from './ExampleWorkspacesTable'

type Props = {
    onWorkspaceSelected: (workspaceUri: string) => void
}

export type ExampleWorkspaceType = {
    workspaceUri: string
    workspaceLabel: string
}

const WorkspaceList: FunctionComponent<Props> = ({onWorkspaceSelected}) => {
    const {returnValue: examples, task} = useTask<ExampleWorkspaceType[]>('example_workspaces.1', {cachebust: '1'})
    const handleExampleSelected = useCallback((ex: ExampleWorkspaceType) => {
        onWorkspaceSelected(ex.workspaceUri)
    }, [onWorkspaceSelected])
    return (
        <div>
            {
                examples ? (
                    <ExampleWorkspacesTable
                        examples={examples}
                        onExampleSelected={handleExampleSelected}
                    />
                ) : task?.status === 'error' ? (
                    <span>Error: {task.errorMessage}</span>
                ) :
                (
                    <span>Loading examples</span>
                )
            }
        </div>
    )
}

export default WorkspaceList