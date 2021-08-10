import { FigureObject } from 'figurl/types';
import React, { FunctionComponent, useCallback } from 'react';
import { useVisible } from '..';
import MarkdownDialog from '../components/Markdown/MarkdownDialog';
import addWorkspaceMd from './addWorkspace.md.gen';
import useRoute from './useRoute';
import WorkspaceList from './WorkspaceList';

type Props = {
    // onUpdated?: () => void
    width: number
    height: number
    packageName: string
}

const SelectWorkspace: FunctionComponent<Props> = ({width, height, packageName}) => {
    const {setRoute} = useRoute()
    // const [closing, setClosing] = useState(false) // hack for now
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
        // no longer used
        const figureObject: FigureObject = {
            type: 'sortingview.workspace.1',
            data: {
                workspaceUri
            }
        }
        setRoute({routePath: `/fig`, figureObjectOrHash: figureObject})
        // setClosing(true) //hack for now
    }, [setRoute])

    // useEffect(() => {
    //     if (closing) { // hack for now
    //         setClosing(false)
    //         onUpdated && onUpdated()
    //     }
    // }, [closing, onUpdated])

    // const selectDisabled = (!editWorkspaceUri)

    const addWorkspaceInstructionsVisible = useVisible()

    return (
        <span>
            <div>
                <h4 style={{padding: 10}}>Note: Do not rely on this workspace list. It will disappear in the future.</h4>
                {/* <div><Button onClick={addWorkspaceInstructionsVisible.show}>Add or remove workspaces</Button></div> */}
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