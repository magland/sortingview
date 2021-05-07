import { Button, TextField } from '@material-ui/core'
import React, { useCallback, useEffect, useState } from 'react'
import { FunctionComponent } from "react"
import useRoute from '../route/useRoute'
import ExampleRecordingSortings from './ExampleRecordingSortings'

type Props = {
    onUpdated?: () => void
}

const SelectRecordingSorting: FunctionComponent<Props> = ({onUpdated}) => {
    const {recordingUri, sortingUri, setRoute} = useRoute()
    const [closing, setClosing] = useState(false) // hack for now

    const [editRecordingUri, setEditRecordingUri] = useState<string>('')
    useEffect(() => {
        setEditRecordingUri(recordingUri || '')
    }, [recordingUri])

    const [editSortingUri, setEditSortingUri] = useState<string>('')
    useEffect(() => {
        setEditSortingUri(sortingUri || '')
    }, [sortingUri])

    const handleSelect = useCallback(() => {
        setRoute({recordingUri: editRecordingUri, sortingUri: editSortingUri})
        setClosing(true) //hack for now
    }, [setRoute, editRecordingUri, editSortingUri, setClosing])

    const handleExampleSelected = useCallback((o: {recordingUri: string, sortingUri: string}) => {
        console.log('--- setting route', o)
        setRoute({recordingUri: o.recordingUri, sortingUri: o.sortingUri})
        setClosing(true) //hack for now
    }, [setRoute, setClosing])

    useEffect(() => {
        if (closing) { // hack for now
            setClosing(false)
            onUpdated && onUpdated()
        }
    }, [closing, onUpdated])

    const selectDisabled = (!editRecordingUri) || (!editSortingUri)

    return (
        <div>
            <TextField style={{width: '100%'}} label="Recording URI" value={editRecordingUri} onChange={evt => setEditRecordingUri(evt.target.value)} />
            <TextField style={{width: '100%'}} label="Sorting URI" value={editSortingUri} onChange={evt => setEditSortingUri(evt.target.value)} />
            <Button disabled={selectDisabled} onClick={handleSelect}>Select</Button>
            <ExampleRecordingSortings onExampleSelected={handleExampleSelected}/>
        </div>
    )
}

export default SelectRecordingSorting