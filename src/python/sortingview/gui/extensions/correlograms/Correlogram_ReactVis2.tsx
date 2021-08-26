import { usePureCalculationTask } from 'kachery-react'
import TaskStatusView from 'kachery-react/components/TaskMonitor/TaskStatusView'
import useChannel from 'kachery-react/useChannel'
import React, { FunctionComponent, useMemo } from 'react'
import { VerticalBarSeries, XAxis, XYPlot, YAxis } from 'react-vis'
import { applyMergesToUnit, Sorting, SortingCuration } from "../../pluginInterface"
// import useCheckForChanges from '../common/useCheckForChanges'


type PlotData = {
    bins: number[]
    bin_counts: number[]
    bin_size_sec: number
}

type Props = {
    sorting: Sorting
    unitId1: number
    unitId2?: number
    applyMerges?: boolean
    curation: SortingCuration
    width: number
    height: number
}

const margin = {left: 60, right: 20, top: 20, bottom: 40}
const xAxisLabel = 'dt (msec)'

const Correlogram_rv2: FunctionComponent<Props> = (props) => {
    const { sorting, unitId1, unitId2, applyMerges, curation, width, height } = props
    // useCheckForChanges('Correlogram_rv2', props)

    const {channelName} = useChannel()
    const {returnValue: plotData, task: taskPlotData} = usePureCalculationTask<PlotData>('fetch_correlogram_plot_data.6', {
        sorting_object: sorting.sortingObject,
        unit_x: applyMergesToUnit(unitId1, curation, applyMerges),
        unit_y: unitId2 !== undefined ? applyMergesToUnit(unitId2, curation, applyMerges) : null,
        subsample: true
    }, {channelName})

    const _plotData = useMemo(() => (plotData || { bins: [], bin_counts: [] }), [plotData])
    const data = useMemo(() => (
        _plotData.bins.map(
            (item: number, index: number) => ( { x: item, y: _plotData.bin_counts[index] } )
        )), [_plotData.bins, _plotData.bin_counts])

    return useMemo(() => (
        plotData
            ? <div className="App">
                  <XYPlot
                      margin={margin}
                      height={height}
                      width={width}
                  >
                      <VerticalBarSeries data={data} barWidth={1} />
                      <XAxis />
                      <YAxis />
                  </XYPlot>
                  <div style={{textAlign: 'center', fontSize: '12px'}}>{xAxisLabel}</div>
              </div>
            : <TaskStatusView label="Fetch correlogram" task={taskPlotData} />
    ), [plotData, data, height, taskPlotData, width])
}



export default Correlogram_rv2;