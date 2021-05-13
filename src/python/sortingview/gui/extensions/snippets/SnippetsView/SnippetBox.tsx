import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import WaveformWidget from '../../averagewaveforms/AverageWaveformsView/WaveformWidget';
import { SortingSelection, SortingSelectionDispatch } from "../../../pluginInterface";
import { Snippet } from './SnippetsRow';

type Props = {
    snippet: Snippet | null
    noiseLevel: number
    samplingFrequency: number
    electrodeIds: number[]
    electrodeLocations: number[][]
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    width: number
    height: number
}

const SnippetBox: FunctionComponent<Props> = ({ snippet, noiseLevel, samplingFrequency, electrodeIds, electrodeLocations, selection, selectionDispatch, width, height }) => {
    const [hasBeenVisible, setHasBeenVisible] = useState(false)
    const handleVisibilityChange = useCallback((isVisible: boolean) => {
        if ((isVisible) && (!hasBeenVisible)) setHasBeenVisible(true)
    }, [hasBeenVisible, setHasBeenVisible])
    const snippetTimepoint = snippet?.timepoint || 0
    const currentTimepoint = selection.currentTimepoint || 0
    const selected = useMemo(() => (
        Math.abs(snippetTimepoint - currentTimepoint) < 20
    ), [snippetTimepoint, currentTimepoint])
    const handleClick = useCallback(() => {
        snippet && selectionDispatch({type: 'SetCurrentTimepoint', currentTimepoint: snippet.timepoint})
    }, [snippet, selectionDispatch])
    return (
        <VisibilitySensor onChange={handleVisibilityChange} partialVisibility={true}>
            {
                hasBeenVisible && snippet ? (
                    <div className={selected ? "plotSelectedStyle" : ""} onClick={handleClick}>
                        <WaveformWidget
                            waveform={snippet.waveform}
                            layoutMode={selection.waveformsMode || 'geom'}
                            {...{selection, selectionDispatch, noiseLevel, samplingFrequency, electrodeIds, electrodeLocations, width, height}}
                            electrodeOpts={{disableSelection: true}}
                        />
                    </div>
                ) : (
                    <div style={{position: 'absolute', width, height}} />
                )
            }
        </VisibilitySensor>
    )
}

export default SnippetBox