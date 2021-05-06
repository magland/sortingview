import { Button, TextField } from '@material-ui/core'
import React, { useCallback, useEffect, useState } from 'react'
import { FunctionComponent } from "react"
import useRoute from '../route/useRoute'
import ExampleRecordingSortings from './ExampleRecordingSortings'

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

    const handleExampleSelected = useCallback((o: {recordingUri: string, sortingUri: string}) => {
        setRoute(o)
        onUpdated && onUpdated()
    }, [onUpdated, setRoute])

    const selectDisabled = (!editRecordingUri) || (!editSortingUri)

    return (
        <div>
            <TextField style={{width: '100%'}} label="Recording URI" value={editRecordingUri} onChange={evt => setEditRecordingUri(evt.target.value)} />
            <TextField style={{width: '100%'}} label="Sorting URI" value={editSortingUri} onChange={evt => setEditSortingUri(evt.target.value)} />
            <Button disabled={selectDisabled} onClick={handleUpdate}>Select</Button>
            <ExampleRecordingSortings onExampleSelected={handleExampleSelected}/>
        </div>
    )
}

export default SelectRecordingSort