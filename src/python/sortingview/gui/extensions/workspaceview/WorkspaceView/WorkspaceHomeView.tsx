import { Button } from '@material-ui/core';
import { useVisible } from 'labbox-react';
import Hyperlink from 'labbox-react/components/Hyperlink/Hyperlink';
import MarkdownDialog from 'labbox-react/components/Markdown/MarkdownDialog';
import ModalWindow from 'labbox-react/components/ModalWindow/ModalWindow';
import useGoogleSignInClient from 'labbox-react/googleSignIn/useGoogleSignInClient';
import useStaticTextReplacement from 'labbox-react/misc/useStaticTextReplacement';
import { WorkspaceState } from 'python/sortingview/gui/pluginInterface/workspaceReducer';
import React, { FunctionComponent } from 'react';
import { WorkspaceRoute, WorkspaceRouteDispatch } from "../../../pluginInterface";
import ImportRecordingsInstructions from './ImportRecordingsInstructions';
import RecordingsTable from './RecordingsTable';
import setSnippetLenMd from './setSnippetLen.md.gen';
import setWorkspacePermissionsMd from './setWorkspacePermissions.md.gen';

type Props = {
    workspace: WorkspaceState
    workspaceRoute: WorkspaceRoute
    onDeleteRecordings: ((recordingIds: string[]) => void) | undefined
    width: number
    height: number
    workspaceRouteDispatch: WorkspaceRouteDispatch
}

const WorkspaceHomeView: FunctionComponent<Props> = ({ width, height, workspace, onDeleteRecordings, workspaceRoute, workspaceRouteDispatch }) => {
    const {recordings, sortings} = workspace
    const importInstructionsVisible = useVisible()
    const setWorkspacePermissionsVisible = useVisible()
    const setSnippetLengthVisible = useVisible()
    const client = useGoogleSignInClient()
    const email = client?.userId ?? 'user_id@gmail.com'
    const interpolatedWorkspacePermissionsMd = useStaticTextReplacement(setWorkspacePermissionsMd, {'USER': email})
    return (
        <span>
            <div>
                {/* {
                    <pre>{JSON.stringify(userPermissions, null, 4)}</pre>
                } */}
                {
                    workspaceRoute.workspaceUri && (
                        <h3>{workspaceRoute.workspaceUri}</h3>
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
                {
                    <p><Hyperlink onClick={setSnippetLengthVisible.show}>Snippets length</Hyperlink>: {workspace.snippetLen ? `(${workspace.snippetLen[0]}, ${workspace.snippetLen[1]})` : 'default'}</p>
                }
                <RecordingsTable
                    {...{sortings, recordings, onDeleteRecordings, workspaceRouteDispatch}}
                />
            </div>
            <ModalWindow
                open={importInstructionsVisible.visible}
                onClose={importInstructionsVisible.hide}
            >
                <ImportRecordingsInstructions
                    workspaceRoute={workspaceRoute}
                />
            </ModalWindow>
            <MarkdownDialog
                visible={setWorkspacePermissionsVisible.visible}
                onClose={setWorkspacePermissionsVisible.hide}
                source={interpolatedWorkspacePermissionsMd}
                substitute={{
                    workspaceUri: workspaceRoute.workspaceUri || '<unknown>'
                }}
            />
            <MarkdownDialog
                visible={setSnippetLengthVisible.visible}
                onClose={setSnippetLengthVisible.hide}
                source={setSnippetLenMd}
                substitute={{
                    workspaceUri: workspaceRoute.workspaceUri || '<unknown>'
                }}
            />
        </span>
    )
}

export default WorkspaceHomeView