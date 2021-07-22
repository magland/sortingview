import { Grid } from '@material-ui/core';
import { useRecordingInfo } from 'python/sortingview/gui/pluginInterface/useRecordingInfo';
import React, { Fragment, FunctionComponent, useCallback, useState } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import { Recording, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from "../../../pluginInterface";
import SnippetsRow from './SnippetsRow';

type Props = {
    recording: Recording
    sorting: Sorting
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    curation: SortingCuration
    unitIds: number[]
    width: number
    height: number
    sortingSelector?: string
}

const WhenVisible: FunctionComponent<{width: number, height: number}> = ({width, height, children}) => {
    const [hasBeenVisible, setHasBeenVisible] = useState(false)
    const handleVisibilityChange = useCallback((isVisible: boolean) => {
        if ((isVisible) && (!hasBeenVisible)) setHasBeenVisible(true)
    }, [hasBeenVisible, setHasBeenVisible])
    return hasBeenVisible ? <Fragment>{children}</Fragment> : (
        <VisibilitySensor onChange={handleVisibilityChange} partialVisibility={true}>
            <div className="WhenVisible" style={{position: 'absolute', width, height}}>Waiting for visible</div>
        </VisibilitySensor>
    )
}

const SnippetsWidget: FunctionComponent<Props> = ({ recording, sorting, selection, selectionDispatch, curation, unitIds, width, height, sortingSelector }) => {
    const recordingInfo = useRecordingInfo(recording.recordingPath)
    const noiseLevel = (recordingInfo || {}).noise_level || 1  // fix this
    const rowHeight = 250
    return (
        <div style={{position: 'absolute', width, height, overflow: 'auto'}}>
            <Grid container direction="column">
                {
                    (unitIds || []).map(unitId => (
                        <Grid item key={unitId} style={{border: 'solid 3px lightgray', marginBottom: 2}}>
                            <h3 style={{paddingTop: 0, paddingBottom: 0, marginTop: 10, marginBottom: 10}}>Snippets for unit {unitId}{sortingSelector || ''}</h3>
                            <WhenVisible width={width} height={rowHeight}>
                                <SnippetsRow {...{recording, sorting, selection, selectionDispatch, curation, unitId, height: rowHeight, noiseLevel}} />
                            </WhenVisible>
                        </Grid>
                    ))
                }
            </Grid>
        </div>
    )
}

export default SnippetsWidget