// import { createCalculationPool } from 'labbox';
import TaskStatusView from 'kachery-react/components/TaskMonitor/TaskStatusView';
import useChannel from 'kachery-react/useChannel';
import usePureCalculationTask from 'kachery-react/usePureCalculationTask';
import React, { FunctionComponent, useMemo } from 'react';
import { applyMergesToUnit, Recording, Sorting, SortingCuration, SortingSelectionDispatch } from '../../../pluginInterface';
import { ElectrodeOpts } from '../../common/sharedCanvasLayers/electrodesLayer';
import { ActionItem, DividerItem } from '../../common/Toolbars';
import WaveformWidget, { defaultWaveformOpts } from './WaveformWidget';

type Props = {
    sorting: Sorting
    recording: Recording
    unitId: number
    selectionDispatch: SortingSelectionDispatch
    curation: SortingCuration
    width: number
    height: number
    noiseLevel: number
    customActions?: (ActionItem | DividerItem)[]
    snippetLen?: [number, number]
    visibleElectrodeIds?: number[]
    selectedElectrodeIds?: number[]
    ampScaleFactor?: number
    applyMerges?: boolean
    waveformsMode?: 'geom' | 'vertical'
}

export type PlotData = {
    average_waveform: number[][]
    channel_ids: number[]
    channel_locations: number[][]
    sampling_frequency: number
}

// const calculationPool = createCalculationPool({maxSimultaneous: 6})

const AverageWaveformView: FunctionComponent<Props> = ({ sorting, curation, recording, unitId, selectionDispatch, width, height, noiseLevel, customActions, snippetLen, visibleElectrodeIds, selectedElectrodeIds, ampScaleFactor, applyMerges, waveformsMode }) => {

    const electrodeOpts: ElectrodeOpts = useMemo(() => ({
        showLabels: true,
        offsetLabels: true
    }), [])
    const {channelName} = useChannel()
    const {returnValue: plotData, task} = usePureCalculationTask<PlotData>(
        'fetch_average_waveform.2',
        {
            sorting_object: sorting.sortingObject,
            recording_object: recording.recordingObject,
            unit_id: applyMergesToUnit(unitId, curation, applyMerges),
            snippet_len: snippetLen
        },
        {
            channelName
        }
    )
    const definedPlotData = plotData || { channel_ids: [], channel_locations: [], average_waveform: [], sampling_frequency: 0 }
    const electrodeIds = useMemo(() => {
        return visibleElectrodeIds
            ? definedPlotData.channel_ids.filter(id => (visibleElectrodeIds.includes(id)))
            : definedPlotData.channel_ids
    }, [visibleElectrodeIds, definedPlotData.channel_ids])
    const electrodeLocations = useMemo(() => {
        return visibleElectrodeIds
            ? definedPlotData.channel_locations.filter((loc, ii) => (visibleElectrodeIds.includes(definedPlotData.channel_ids[ii])))
            : definedPlotData.channel_locations
    }, [visibleElectrodeIds, definedPlotData.channel_ids, definedPlotData.channel_locations] )

    return plotData
        ? <WaveformWidget
            waveform={definedPlotData.average_waveform}
            layoutMode={waveformsMode || 'geom'}
            noiseLevel={noiseLevel}
            electrodeIds={electrodeIds}
            electrodeLocations={electrodeLocations}
            samplingFrequency={definedPlotData.sampling_frequency}
            width={width}
            height={height}
            selectedElectrodeIds={selectedElectrodeIds || []}
            ampScaleFactor={ampScaleFactor || 1}
            customActions={customActions}
            selectionDispatch={selectionDispatch}
            electrodeOpts={electrodeOpts}
            waveformOpts={defaultWaveformOpts}
        />
        : <TaskStatusView task={task} label="fetch avg waveform" />
}

export default AverageWaveformView