import { Button } from '@material-ui/core';
import { useVisible } from 'figurl/labbox-react';
import Hyperlink from 'figurl/labbox-react/components/Hyperlink/Hyperlink';
import MarkdownDialog from 'figurl/labbox-react/components/Markdown/MarkdownDialog';
import ModalWindow from 'figurl/labbox-react/components/ModalWindow/ModalWindow';
import { WorkspaceState } from 'python/sortingview/gui/pluginInterface/workspaceReducer';
import React, { FunctionComponent } from 'react';
import { WorkspaceRoute, WorkspaceRouteDispatch } from "../../../pluginInterface";
import ImportRecordingsInstructions from './ImportRecordingsInstructions';
import RecordingsTable from './RecordingsTable';
import setSnippetLenMd from './setSnippetLen.md.gen';
import setWorkspacePermissionsMd from './setWorkspacePermissions.md.gen';
import figurlInstructionsMd from './figurlInstructions.md.gen';
import { useChannel } from 'kachery-react';

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
    const figurlInstructionsVisible = useVisible()
    const setSnippetLengthVisible = useVisible()
    const workspaceUri = workspaceRoute.workspaceUri || '<unknown>'
    const loggedInUserEmail = useGoogleSignInClient()?.userId ?? 'user_id@gmail.com'
    const {channelName} = useChannel()
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
                    !figurlInstructionsVisible.visible && (
                        <div><Button onClick={figurlInstructionsVisible.show}>View workspace in figurl</Button></div>
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
                source={setWorkspacePermissionsMd}
                substitute={{
                    'WORKSPACE_URI': workspaceUri,
                    'USER': loggedInUserEmail
                }}
            />
            <MarkdownDialog
                visible={figurlInstructionsVisible.visible}
                onClose={figurlInstructionsVisible.hide}
                source={figurlInstructionsMd}
                substitute={{
                    'WORKSPACE_URI': workspaceUri,
                    'CHANNEL': channelName.toString()
                }}
            />
            <MarkdownDialog
                visible={setSnippetLengthVisible.visible}
                onClose={setSnippetLengthVisible.hide}
                source={setSnippetLenMd}
                substitute={{
                    'WORKSPACE_URI': workspaceUri
                }}
            />
        </span>
    )
}

export default WorkspaceHomeView