// import { createCalculationPool } from 'labbox';
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import TaskStatusView from 'figurl/kachery-react/components/TaskMonitor/TaskStatusView';
import useChannel from 'figurl/kachery-react/useChannel';
import usePureCalculationTask from 'figurl/kachery-react/usePureCalculationTask';
import React, { FunctionComponent, useMemo } from 'react';
import { applyMergesToUnit, Recording, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from '../../../pluginInterface';
import WaveformWidget, { defaultWaveformOpts } from '../../averagewaveforms/AverageWaveformsView/WaveformWidget';
import { ElectrodeOpts } from '../../common/sharedCanvasLayers/electrodesLayer';
import { ActionItem, DividerItem } from '../../common/Toolbars';

type PlotData = {
    average_waveform: number[][]
    channel_ids: number[]
    channel_locations: number[][]
    sampling_frequency: number
}

const extractChannels = (plotData: PlotData, channelIds: number[]): PlotData => {
    const channelInds = channelIds.map(id => (plotData.channel_ids.indexOf(id)))
    return {
        average_waveform: channelIds.map((_, i) => (plotData.average_waveform[channelInds[i]])),
        channel_ids: channelIds,
        channel_locations: channelIds.map((_, i) => (plotData.channel_locations[channelInds[i]])),
        sampling_frequency: plotData.sampling_frequency
    }
}

type Props = {
    sorting: Sorting
    recording: Recording
    unitIds: number[]
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    curation?: SortingCuration
    width: number
    height: number
    noiseLevel: number
    customActions?: (ActionItem | DividerItem)[]
    snippetLen?: [number, number]
    sortingSelector?: string
}

// const calculationPool = createCalculationPool({maxSimultaneous: 6})

const PairWaveformView: FunctionComponent<Props> = ({ sorting, curation, recording, unitIds, selection, selectionDispatch, width, height, noiseLevel, customActions, snippetLen, sortingSelector }) => {
    const unitIdsX = useMemo(() => (unitIds.map(unitId => (applyMergesToUnit(unitId, curation, selection.applyMerges)))), [unitIds, curation, selection])
    const unitId1 = unitIdsX[0]
    const unitId2 = unitIdsX[1]

    const {channelName} = useChannel()
    const {returnValue: plotData1, task: task1} = usePureCalculationTask<PlotData>(
        'fetch_average_waveform.2',
        {
            sorting_object: sorting.sortingObject,
            recording_object: recording.recordingObject,
            unit_id: unitId1,
            snippet_len: snippetLen
        },
        {
            channelName
        }
    )
    const {returnValue: plotData2, task: task2} = usePureCalculationTask<PlotData>(
        'fetch_average_waveform.2',
        {
            sorting_object: sorting.sortingObject,
            recording_object: recording.recordingObject,
            unit_id: unitId2,
            snippet_len: snippetLen
        },
        {
            channelName
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

    const electrodeOpts: ElectrodeOpts = useMemo(() => ({
        showLabels: true,
        offsetLabels: true
    }), [])

    if (!plotData1) {
        return <TaskStatusView task={task1} label="fetch avg waveform" />
    }
    if (!plotData2) {
        return <TaskStatusView task={task2} label="fetch avg waveform" />
    }

    const commonChannelIds = plotData1.channel_ids.filter(id => (plotData2.channel_ids.includes(id)))
    const plotData1b = extractChannels(plotData1, commonChannelIds)
    const plotData2b = extractChannels(plotData2, commonChannelIds)

    const visibleElectrodeIds = selection.visibleElectrodeIds

    const electrodeIds1 = plotData1b.channel_ids.filter(id => ((!visibleElectrodeIds) || (visibleElectrodeIds.includes(id))))
    const electrodeLocations1 = plotData1b.channel_locations.filter((loc, ii) => ((!visibleElectrodeIds) || (visibleElectrodeIds.includes(plotData1b.channel_ids[ii]))))

    const electrodeIds2 = plotData2b.channel_ids.filter(id => ((!visibleElectrodeIds) || (visibleElectrodeIds.includes(id))))
    const electrodeLocations2 = plotData2b.channel_locations.filter((loc, ii) => ((!visibleElectrodeIds) || (visibleElectrodeIds.includes(plotData2b.channel_ids[ii]))))

    const boxWidth = (width - 60) / 2
    return (
        <Table>
            <TableBody>
                <TableRow>
                    <TableCell>Unit {unitId1}{sortingSelector || ''}</TableCell>
                    <TableCell>Unit {unitId2}{sortingSelector || ''}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <WaveformWidget
                            waveform={plotData1b.average_waveform}
                            layoutMode={selection.waveformsMode || 'geom'}
                            noiseLevel={noiseLevel}
                            electrodeIds={electrodeIds1}
                            electrodeLocations={electrodeLocations1}
                            samplingFrequency={plotData1b.sampling_frequency}
                            width={boxWidth}
                            height={height}
                            ampScaleFactor={selection.ampScaleFactor || 1}
                            selectedElectrodeIds={selection.selectedElectrodeIds || []}
                            customActions={customActions}
                            selectionDispatch={selectionDispatch}
                            electrodeOpts={electrodeOpts}
                            waveformOpts={defaultWaveformOpts}
                        />
                    </TableCell>
                    <TableCell>
                        <WaveformWidget
                            waveform={plotData2b.average_waveform}
                            layoutMode={selection.waveformsMode || 'geom'}
                            noiseLevel={noiseLevel}
                            electrodeIds={electrodeIds2}
                            electrodeLocations={electrodeLocations2}
                            samplingFrequency={plotData2b.sampling_frequency}
                            width={boxWidth}
                            height={height}
                            ampScaleFactor={selection.ampScaleFactor || 1}
                            selectedElectrodeIds={selection.selectedElectrodeIds || []}
                            customActions={customActions}
                            selectionDispatch={selectionDispatch}
                            electrodeOpts={electrodeOpts}
                            waveformOpts={defaultWaveformOpts}
                        />
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}

export default PairWaveformView