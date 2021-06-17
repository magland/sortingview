import { Button } from '@material-ui/core'
import React, { useCallback, useEffect, useState } from 'react'
import { FunctionComponent } from "react"
import Splitter from '../commonComponents/Splitter/Splitter'
import { useVisible } from '../labbox'
import useRoute from '../route/useRoute'
import AddWorkspaceInstructions from './AddWorkspaceInstructions'
import WorkspaceList from './WorkspaceList'

type Props = {
    onUpdated?: () => void
    width: number
    height: number
}

const SelectWorkspace: FunctionComponent<Props> = ({onUpdated, width, height}) => {
    const {setRoute} = useRoute()
    const [closing, setClosing] = useState(false) // hack for now
    const {visible: instructionsVisible, show: showInstructions} = useVisible()

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

    return (
        <Splitter
            {...{width, height}}
            initialPosition={300}
            positionFromRight={true}
        >
            <div>
                {
                    !instructionsVisible && (
                        <div><Button onClick={showInstructions}>Add workspace</Button></div>
                    )
                }
                {/* <TextField style={{width: '100%'}} label="Workspace URI" value={editWorkspaceUri} onChange={evt => setEditWorkspaceUri(evt.target.value)} />
                <Button disabled={selectDisabled} onClick={handleSelect}>Select</Button> */}
                <WorkspaceList onWorkspaceSelected={handleWorkspaceSelected}/>
            </div>
            {
                instructionsVisible && (
                    <AddWorkspaceInstructions />
                )
            }
        </Splitter>
    )
}

export default SelectWorkspace