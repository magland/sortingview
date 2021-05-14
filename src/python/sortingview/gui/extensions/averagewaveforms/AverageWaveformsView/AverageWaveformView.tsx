// import { createCalculationPool } from 'labbox';
import React, { FunctionComponent, useMemo } from 'react';
import { ActionItem, DividerItem } from '../../../common/Toolbars';
import { TaskStatusView, useTask } from '../../../labbox';
import { applyMergesToUnit, Recording, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from '../../../pluginInterface';
import WaveformWidget, { ElectrodeOpts } from './WaveformWidget';

type PlotData = {
    average_waveform: number[][]
    channel_ids: number[]
    channel_locations: number[][]
    sampling_frequency: number
}

type Props = {
    sorting: Sorting
    recording: Recording
    unitId: number
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    curation: SortingCuration
    width: number
    height: number
    noiseLevel: number
    customActions?: (ActionItem | DividerItem)[]
}

// const calculationPool = createCalculationPool({maxSimultaneous: 6})

const AverageWaveformView: FunctionComponent<Props> = ({ sorting, curation, recording, unitId, selection, selectionDispatch, width, height, noiseLevel, customActions }) => {
    const {returnValue: plotData, task} = useTask<PlotData>(
        'fetch_average_waveform.2',
        {
            sorting_object: sorting.sortingObject,
            recording_object: recording.recordingObject,
            unit_id: applyMergesToUnit(unitId, curation, selection.applyMerges)
        }
    )
    // const {returnValue: test} = useTask(
    //     'test_delay.1',
    //     {
    //         delay_sec: 500,
    //         cachebust: applyMergesToUnit(unitId, curation, selection.applyMerges)
    //     }
    // )
    // useEffect(() => {
    //     if (test) console.log('test result', test)
    // }, [test])

    const electrodeOpts: ElectrodeOpts = useMemo(() => ({}), [])

    if (!plotData) {
        return <TaskStatusView task={task} label="fetch avg waveform" />
    }
    const visibleElectrodeIds = selection.visibleElectrodeIds
    const electrodeIds = plotData.channel_ids.filter(id => ((!visibleElectrodeIds) || (visibleElectrodeIds.includes(id))))
    const electrodeLocations = plotData.channel_locations.filter((loc, ii) => ((!visibleElectrodeIds) || (visibleElectrodeIds.includes(plotData.channel_ids[ii]))))
    return (
        <WaveformWidget
            waveform={plotData.average_waveform}
            layoutMode={selection.waveformsMode || 'geom'}
            noiseLevel={noiseLevel}
            electrodeIds={electrodeIds}
            electrodeLocations={electrodeLocations}
            samplingFrequency={plotData.sampling_frequency}
            width={width}
            height={height}
            selection={selection}
            customActions={customActions}
            selectionDispatch={selectionDispatch}
            electrodeOpts={electrodeOpts}
        />
    )
}

export default AverageWaveformView