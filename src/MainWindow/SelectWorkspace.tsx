import { Button, TextField } from '@material-ui/core'
import React, { useCallback, useEffect, useState } from 'react'
import { FunctionComponent } from "react"
import useRoute from '../route/useRoute'
import WorkspaceList from './WorkspaceList'

type Props = {
    onUpdated?: () => void
}

const SelectWorkspace: FunctionComponent<Props> = ({onUpdated}) => {
    const {workspaceUri, setRoute} = useRoute()
    const [closing, setClosing] = useState(false) // hack for now

    const [editWorkspaceUri, setEditWorkspaceUri] = useState<string>('')
    useEffect(() => {
        setEditWorkspaceUri(workspaceUri || '')
    }, [workspaceUri])

    const handleSelect = useCallback(() => {
        setRoute({workspaceUri: editWorkspaceUri})
        setClosing(true) //hack for now
    }, [setRoute, editWorkspaceUri, setClosing])

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

    const selectDisabled = (!editWorkspaceUri)

    return (
        <div>
            <TextField style={{width: '100%'}} label="Workspace URI" value={editWorkspaceUri} onChange={evt => setEditWorkspaceUri(evt.target.value)} />
            <Button disabled={selectDisabled} onClick={handleSelect}>Select</Button>
            <WorkspaceList onWorkspaceSelected={handleWorkspaceSelected}/>
        </div>
    )
}

export default SelectWorkspace