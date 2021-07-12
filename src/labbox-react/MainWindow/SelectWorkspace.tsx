import { Button } from '@material-ui/core';
import { useVisible } from 'labbox-react';
import MarkdownDialog from 'labbox-react/components/Markdown/MarkdownDialog';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import addWorkspaceMd from './addWorkspace.md.gen';
import useRoute from './useRoute';
import WorkspaceList from './WorkspaceList';

type Props = {
    onUpdated?: () => void
    width: number
    height: number
    packageName: string
}

const SelectWorkspace: FunctionComponent<Props> = ({onUpdated, width, height, packageName}) => {
    const {setRoute} = useRoute()
    const [closing, setClosing] = useState(false) // hack for now
    // const {visible: instructionsVisible, show: showInstructions} = useVisible()

    // const [editWorkspaceUri, setEditWorkspaceUri] = useState<string>('')
    // useEffect(() => {
    //     setEditWorkspaceUri(workspaceUri || '')
    // }, [workspaceUri])

    // const handleSelect = useCallback(() => {
    //     setRoute({workspaceUri: editWorkspaceUri})
    //     setClosing(true) //hack for now
    // }, [setRoute, editWorkspaceUri, setClosing])

    const handleWorkspaceSelected = useCallback((workspaceUri: string) => {
        setRoute({workspaceUri})
        setClosing(true) //hack for now
    }, [setRoute, setClosing])

    useEffect(() => {
        if (closing) { // hack for now
            setClosing(false)
            onUpdated && onUpdated()
        }
    }, [closing, onUpdated])

    // const selectDisabled = (!editWorkspaceUri)

    const addWorkspaceInstructionsVisible = useVisible()

    return (
        <span>
            <div>
                {
                    <div><Button onClick={addWorkspaceInstructionsVisible.show}>Add workspace</Button></div>
                }
                {/* <TextField style={{width: '100%'}} label="Workspace URI" value={editWorkspaceUri} onChange={evt => setEditWorkspaceUri(evt.target.value)} />
                <Button disabled={selectDisabled} onClick={handleSelect}>Select</Button> */}
                <WorkspaceList onWorkspaceSelected={handleWorkspaceSelected} packageName={packageName}/>
            </div>
            {/* {
                instructionsVisible && (
                    <AddWorkspaceInstructions />
                )
            } */}
            <MarkdownDialog
                visible={addWorkspaceInstructionsVisible.visible}
                onClose={addWorkspaceInstructionsVisible.hide}
                source={addWorkspaceMd}
            />
        </span>

    )
}

export default SelectWorkspace