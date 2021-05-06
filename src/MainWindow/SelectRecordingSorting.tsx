import { Button, TextField } from '@material-ui/core'
import React, { useCallback, useEffect, useState } from 'react'
import { FunctionComponent } from "react"
import useRoute from '../route/useRoute'

type Props = {
    onUpdated?: () => void
}

const SelectRecordingSort: FunctionComponent<Props> = ({onUpdated}) => {
    const {recordingUri, sortingUri, setRoute} = useRoute()

    const [editRecordingUri, setEditRecordingUri] = useState<string>('')
    useEffect(() => {
        setEditRecordingUri(recordingUri || '')
    }, [recordingUri])

    const [editSortingUri, setEditSortingUri] = useState<string>('')
    useEffect(() => {
        setEditSortingUri(sortingUri || '')
    }, [sortingUri])

    const handleUpdate = useCallback(() => {
        setRoute({recordingUri: editRecordingUri, sortingUri: editSortingUri})
        onUpdated && onUpdated()
    }, [setRoute, editRecordingUri, editSortingUri, onUpdated])

    const updateDisabled = ((editRecordingUri === recordingUri) && (editSortingUri === sortingUri)) || (!editRecordingUri) || (!editSortingUri)

    return (
        <div>
            <TextField style={{width: '100%'}} label="Recording URI" value={editRecordingUri} onChange={evt => setEditRecordingUri(evt.target.value)} />
            <TextField style={{width: '100%'}} label="Sorting URI" value={editSortingUri} onChange={evt => setEditSortingUri(evt.target.value)} />
            <Button disabled={updateDisabled} onClick={handleUpdate}>Update</Button>
        </div>
    )
}

export default SelectRecordingSort