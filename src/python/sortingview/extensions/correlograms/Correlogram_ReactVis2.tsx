import { createCalculationPool, useHitherJob } from 'labbox';
import React, { FunctionComponent } from 'react';
import { VerticalBarSeries, XAxis, XYPlot, YAxis } from 'react-vis';
import HitherJobStatusView from '../common/HitherJobStatusView';
import { applyMergesToUnit, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from "../pluginInterface";

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
    curation: SortingCuration
    selectionDispatch: SortingSelectionDispatch
    width: number
    height: number
}

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const Correlogram_rv2: FunctionComponent<Props> = ({ sorting, unitId1, unitId2, selection, curation, selectionDispatch, width, height }) => {
    
    const {result: plotData, job} = useHitherJob<PlotData>(
        'createjob_fetch_correlogram_plot_data',
        {
            sorting_object: sorting.sortingObject,
            unit_x: applyMergesToUnit(unitId1, curation, selection.applyMerges),
            unit_y: unitId2 !== undefined ? applyMergesToUnit(unitId2, curation, selection.applyMerges) : null
        },
        {useClientCache: false, calculationPool}
    )

    if (!plotData) {
        return <HitherJobStatusView job={job} width={width} height={height} />
    }
    const data = plotData.bins.map((item: number, index: number) => {
        return { x: item, y: plotData.bin_counts[index] };
    })

    const xAxisLabel = 'dt (msec)'

    return (
        <div className="App">
            <XYPlot
                margin={30}
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