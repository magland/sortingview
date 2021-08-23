// import { createCalculationPool } from 'labbox';
import TaskStatusView from 'kachery-react/components/TaskMonitor/TaskStatusView';
import { Task } from "kachery-react/initiateTask";
import React, { FunctionComponent, useMemo } from 'react';
import { SortingSelectionDispatch } from '../../../pluginInterface';
import { ElectrodeOpts } from '../../common/sharedCanvasLayers/electrodesLayer';
import { ActionItem, DividerItem } from '../../common/Toolbars';
import { PlotData } from './AverageWaveformsView';
import WaveformWidget, { defaultWaveformOpts } from './WaveformWidget';


type Props = {
    plotDataTask: Task<PlotData>
    selectionDispatch: SortingSelectionDispatch
    width: number
    height: number
    noiseLevel: number
    customActions?: (ActionItem | DividerItem)[]
    selectedElectrodeIds?: number[]
    ampScaleFactor?: number
    waveformsMode?: 'geom' | 'vertical'
}

// const calculationPool = createCalculationPool({maxSimultaneous: 6})

const AverageWaveformView: FunctionComponent<Props> = ({ plotDataTask, selectionDispatch, width, height, noiseLevel, customActions, selectedElectrodeIds, ampScaleFactor, waveformsMode }) => {

    const electrodeOpts: ElectrodeOpts = useMemo(() => ({
        showLabels: true,
        offsetLabels: true
    }), [])
    const definedPlotData = plotDataTask?.result || { channel_ids: [], channel_locations: [], average_waveform: [], sampling_frequency: 0 }

    return plotDataTask?.status === 'finished'
        ? <WaveformWidget
            waveform={definedPlotData.average_waveform}
            layoutMode={waveformsMode || 'geom'}
            noiseLevel={noiseLevel}
            electrodeIds={definedPlotData.channel_ids}
            electrodeLocations={definedPlotData.channel_locations}
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
        : <TaskStatusView task={plotDataTask} label="fetch avg waveform" />
}

export default AverageWaveformView