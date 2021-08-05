import Hyperlink from '../components/Hyperlink/Hyperlink';
import NiceTable from '../components/NiceTable/NiceTable';
import React, { FunctionComponent, useMemo } from 'react';
import { WorkspaceListWorkspace } from './WorkspaceList';

type Props = {
    workspaceList: WorkspaceListWorkspace[]
    onWorkspaceSelected: (workspace: WorkspaceListWorkspace) => void
    // onDeleteWorkspace?: (name: string) => void
}

const WorkspacesTable: FunctionComponent<Props> = ({workspaceList, onWorkspaceSelected}) => {
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
    const rows = useMemo(() => {
        const sortedWorkspaceList = [...workspaceList]
        sortedWorkspaceList.sort((w1, w2) => {
            return (w1.label < w2.label) ? -1 : (w1.label > w2.label) ? 1 : 0
        })
        return sortedWorkspaceList.map((x, i)=> ({
            key: x.workspaceUri,
            columnValues: {
                label: {
                    text: x.label,
                    element: <Hyperlink onClick={() => {onWorkspaceSelected(x)}}>{x.label}</Hyperlink>
                },
                uri: x.workspaceUri
            }
        }))
    }, [workspaceList, onWorkspaceSelected])
    // const handleDeleteRow = useCallback((key: string) => {
    //     onDeleteWorkspace && onDeleteWorkspace(key)
    // }, [onDeleteWorkspace])
    return (
        <NiceTable
            columns={columns}
            rows={rows}
            // onDeleteRow={onDeleteWorkspace ? handleDeleteRow : undefined}
        />
    )
}

export default WorkspacesTable