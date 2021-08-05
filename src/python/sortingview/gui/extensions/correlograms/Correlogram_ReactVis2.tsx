import TaskStatusView from 'figurl/kachery-react/components/TaskMonitor/TaskStatusView';
import React, { FunctionComponent } from 'react';
import { VerticalBarSeries, XAxis, XYPlot, YAxis } from 'react-vis';
import { usePureCalculationTask } from 'figurl/kachery-react';
import useChannel from 'figurl/kachery-react/useChannel'
import { applyMergesToUnit, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from "../../pluginInterface";

type PlotData = {
    bins: number[]
    bin_counts: number[]
    bin_size_sec: number
}

type Props = {
    sorting: Sorting
    unitId1: number
    unitId2?: number
    selection: SortingSelection
    curation?: SortingCuration
    selectionDispatch: SortingSelectionDispatch
    width: number
    height: number
}

const Correlogram_rv2: FunctionComponent<Props> = ({ sorting, unitId1, unitId2, selection, curation, selectionDispatch, width, height }) => {
    
    // const {result: plotData, job} = useHitherJob<PlotData>(
    //     'createjob_fetch_correlogram_plot_data',
    //     {
    //         sorting_object: sorting.sortingObject,
    //         unit_x: applyMergesToUnit(unitId1, curation, selection.applyMerges),
    //         unit_y: unitId2 !== undefined ? applyMergesToUnit(unitId2, curation, selection.applyMerges) : null
    //     },
    //     {useClientCache: false, calculationPool}
    // )

    const {channelName} = useChannel()
    const {returnValue: plotData, task: taskPlotData} = usePureCalculationTask<PlotData>('fetch_correlogram_plot_data.6', {
        sorting_object: sorting.sortingObject,
        unit_x: applyMergesToUnit(unitId1, curation, selection.applyMerges),
        unit_y: unitId2 !== undefined ? applyMergesToUnit(unitId2, curation, selection.applyMerges) : null,
        subsample: true
    }, {channelName})

    if (!plotData) {
        // return <HitherJobStatusView job={job} width={width} height={height} />
        return <TaskStatusView label="Fetch correlogram" task={taskPlotData} />
    }
    const data = plotData.bins.map((item: number, index: number) => {
        return { x: item, y: plotData.bin_counts[index] };
    })

    const xAxisLabel = 'dt (msec)'

    return (
        <div className="App">
            <XYPlot
                margin={{left: 60, right: 20, top: 20, bottom: 40}}
                height={height}
                width={width}
            >
                <VerticalBarSeries data={data} barWidth={1} />
                <XAxis />
                <YAxis />
            </XYPlot>
            <div style={{textAlign: 'center', fontSize: '12px'}}>{xAxisLabel}</div>
        </div>
    );
}



export default Correlogram_rv2;