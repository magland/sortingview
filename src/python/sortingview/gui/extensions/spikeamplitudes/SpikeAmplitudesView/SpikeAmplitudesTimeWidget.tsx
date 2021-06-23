import { applyMergesToUnit, Recording, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch, sortingSelectionReducer } from 'python/sortingview/gui/pluginInterface';
import { useRecordingInfo } from 'python/sortingview/gui/pluginInterface/useRecordingInfo';
import { useSortingInfo } from 'python/sortingview/gui/pluginInterface/useSortingInfo';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import useBufferedDispatch from '../../common/useBufferedDispatch';
import { getArrayMax, getArrayMin } from '../../common/utility';
import TimeWidgetNew from '../../timeseries/TimeWidgetNew/TimeWidgetNew';
import SpikeAmplitudesPanel, { combinePanels } from './SpikeAmplitudesPanel';
import { SpikeAmplitudesData } from './useSpikeAmplitudesData';
;

type Props = {
    spikeAmplitudesData: SpikeAmplitudesData
    recording: Recording
    sorting: Sorting
    unitIds: number[]
    width: number
    height: number,
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    curation: SortingCuration
}

const SpikeAmplitudesTimeWidget: FunctionComponent<Props> = ({ spikeAmplitudesData, recording, sorting, curation, unitIds, width, height, selection: externalSelection, selectionDispatch: externalSelectionDispatch }) => {
    const sortingInfo = useSortingInfo(sorting.sortingPath)
    const recordingInfo = useRecordingInfo(recording.recordingPath)

    const [selection, selectionDispatch] = useBufferedDispatch(sortingSelectionReducer, externalSelection, useMemo(() => ((state: SortingSelection) => {externalSelectionDispatch({type: 'Set', state})}), [externalSelectionDispatch]), 400)

    const [spikeAmplitudesPanels, setSpikeAmplitudesPanels] = useState<SpikeAmplitudesPanel[] | null>(null)

    useEffect(() => {
        const panels: SpikeAmplitudesPanel[] = []
        const allMins: number[] = []
        const allMaxs: number[] = []

        unitIds.forEach(unitId => {
            const uid = applyMergesToUnit(unitId, curation, selection.applyMerges)
            const p = new SpikeAmplitudesPanel({spikeAmplitudesData, recording, sorting, unitId: uid})
            const amps = spikeAmplitudesData.getSpikeAmplitudes(uid)
            if (amps) {
                allMins.push(amps.minAmp)
                allMaxs.push(amps.maxAmp)
            }
            panels.push(p)
        })
        // we want the y-axis to show even when no units are selected
        if (panels.length === 0) {
            panels.push(new SpikeAmplitudesPanel({
                spikeAmplitudesData: null,
                recording,
                sorting,
                unitId: -1
            }))
        }
        if (allMins.length > 0) {
            panels.forEach(p => {
                p.setGlobalAmplitudeRange({min: getArrayMin(allMins), max: getArrayMax(allMaxs)})
            })
        }
        setSpikeAmplitudesPanels(panels)
    }, [unitIds, sorting, curation, recording, spikeAmplitudesData, selection]) // important that this depends on selection so that we refresh when time range changes

    const panels = useMemo(() => (
        spikeAmplitudesPanels ? [combinePanels(spikeAmplitudesPanels, '')] : [] as SpikeAmplitudesPanel[]
    ), [spikeAmplitudesPanels])

    if (!sortingInfo) return <div>No sorting info</div>
    if (!recordingInfo) return <div>No recording info</div>
    return (
        <TimeWidgetNew
            panels={panels}
            width={width}
            height={height}
            samplerate={sortingInfo.samplerate}
            maxTimeSpan={sortingInfo.samplerate * 60 * 5}
            startTimeSpan={sortingInfo.samplerate * 60 * 1}
            numTimepoints={recordingInfo.num_frames}
            selection={selection}
            selectionDispatch={selectionDispatch}
        />
    )
}

export default SpikeAmplitudesTimeWidget