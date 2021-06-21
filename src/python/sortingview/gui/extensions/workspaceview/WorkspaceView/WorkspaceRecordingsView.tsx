import { Button } from '@material-ui/core';
import { useVisible } from 'labbox-react';
import MarkdownDialog from 'labbox-react/components/Markdown/MarkdownDialog';
import Splitter from 'labbox-react/components/Splitter/Splitter';
import { WorkspaceState } from 'python/sortingview/gui/pluginInterface/workspaceReducer';
import React, { FunctionComponent } from 'react';
import { WorkspaceRoute, WorkspaceRouteDispatch } from "../../../pluginInterface";
import ImportRecordingsInstructions from './ImportRecordingsInstructions';
import RecordingsTable from './RecordingsTable';
import setWorkspacePermissionsMd from './setWorkspacePermissions.md.gen';

type Props = {
    workspace: WorkspaceState
    workspaceRoute: WorkspaceRoute
    onDeleteRecordings: ((recordingIds: string[]) => void) | undefined
    width: number
    height: number
    workspaceRouteDispatch: WorkspaceRouteDispatch
}

const WorkspaceRecordingsView: FunctionComponent<Props> = ({ width, height, workspace, onDeleteRecordings, workspaceRoute, workspaceRouteDispatch }) => {
    const {recordings, sortings, userPermissions} = workspace
    const importInstructionsVisible = useVisible()
    const setWorkspacePermissionsVisible = useVisible()
    return (
        <span>
            <Splitter
                {...{width, height}}
                initialPosition={300}
                positionFromRight={true}
            >
                <div style={{padding: 20}}>
                    {
                        <pre>{JSON.stringify(userPermissions, null, 4)}</pre>
                    }
                    {
                        workspaceRoute.workspaceUri && (
                            <h3>Workspace: {workspaceRoute.workspaceUri}</h3>
                        )
                    }
                    {
                        <div><Button onClick={setWorkspacePermissionsVisible.show}>Set workspace permissions</Button></div>
                    }
                    {
                        !importInstructionsVisible.visible && (
                            <div><Button onClick={importInstructionsVisible.show}>Import recordings</Button></div>
                        )
                    }
                    <RecordingsTable
                        {...{sortings, recordings, onDeleteRecordings, workspaceRouteDispatch}}
                    />
                </div>
                {
                    importInstructionsVisible.visible && (
                        <ImportRecordingsInstructions
                            workspaceRoute={workspaceRoute}
                        />
                    )
                }
            </Splitter>
            <MarkdownDialog
                visible={setWorkspacePermissionsVisible.visible}
                onClose={setWorkspacePermissionsVisible.hide}
                source={setWorkspacePermissionsMd}
                substitute={{
                    workspaceUri: workspaceRoute.workspaceUri || '<unknown>'
                }}
            />
        </span>
    )
}

export default WorkspaceRecordingsView