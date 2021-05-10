import { Checkbox } from '@material-ui/core';
import React, { FunctionComponent, useCallback } from 'react';
import { SortingSelection, SortingSelectionDispatch } from "../../pluginInterface";

type Props = {
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
}

const OptionsControl: FunctionComponent<Props> = ({ selection, selectionDispatch }) => {
    return (
        <div>
            <WaveformLayoutControl selection={selection} selectionDispatch={selectionDispatch} />
        </div>
    )
}

const WaveformLayoutControl: FunctionComponent<{selection: SortingSelection, selectionDispatch: SortingSelectionDispatch}> = ({ selection, selectionDispatch }) => {
    const waveformsMode = selection.waveformsMode || 'geom'
    const checked = waveformsMode === 'geom'

    const handleToggle = useCallback(() => {
        selectionDispatch({type: 'SetWaveformsMode', waveformsMode: waveformsMode === 'geom' ? 'vertical' : 'geom'})
    }, [waveformsMode, selectionDispatch])

    return (
        <div>
            <span>Waveforms:</span>
            <span style={{whiteSpace: 'nowrap'}}>
                <Checkbox checked={checked} onClick={handleToggle}/> Use electrode geom
            </span>
        </div>
    )
}



export default OptionsControl