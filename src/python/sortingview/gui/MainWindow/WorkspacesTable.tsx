import React, { useCallback, useMemo } from 'react'
import { FunctionComponent } from "react"
import Hyperlink from '../commonComponents/Hyperlink/Hyperlink'
import NiceTable from '../commonComponents/NiceTable/NiceTable'
import { WorkspaceListWorkspace } from './WorkspaceList'

type Props = {
    workspaces: WorkspaceListWorkspace[]
    onWorkspaceSelected: (workspace: WorkspaceListWorkspace) => void
    onDeleteWorkspace?: (name: string) => void
}

const WorkspacesTable: FunctionComponent<Props> = ({workspaces, onWorkspaceSelected, onDeleteWorkspace}) => {
    const columns = useMemo(() => ([
        {
            key: 'label',
            label: 'Workspace'
        },
        {
            key: 'uri',
            label: 'URI'
        },
    ]), [])
    const rows = useMemo(() => (
        workspaces.map((x, i)=> ({
            key: x.name,
            columnValues: {
                label: {
                    text: x.name,
                    element: <Hyperlink onClick={() => {onWorkspaceSelected(x)}}>{x.name}</Hyperlink>
                },
                uri: x.uri
            }
        }))
    ), [workspaces, onWorkspaceSelected])
    const handleDeleteRow = useCallback((key: string) => {
        onDeleteWorkspace && onDeleteWorkspace(key)
    }, [onDeleteWorkspace])
    return (
        <NiceTable
            columns={columns}
            rows={rows}
            onDeleteRow={onDeleteWorkspace ? handleDeleteRow : undefined}
        />
    )
}

export default WorkspacesTable