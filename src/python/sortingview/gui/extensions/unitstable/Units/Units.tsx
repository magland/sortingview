
import { Button, Paper } from '@material-ui/core';
import { runPureCalculationTaskAsync } from 'kachery-react';
import useChannel from 'kachery-react/useChannel';
import useKacheryNode from 'kachery-react/useKacheryNode';
import { usePlugins } from 'labbox-react';
import sortByPriority from 'labbox-react/extensionSystem/sortByPriority';
import { SortingComparisonUnitMetricPlugin } from 'python/sortingview/gui/pluginInterface/SortingComparisonUnitMetricPlugin';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { LabboxPlugin, Recording, sortingComparisonUnitMetricPlugins, SortingUnitMetricPlugin, sortingUnitMetricPlugins, SortingViewProps } from "../../../pluginInterface";
import UnitsTable from './UnitsTable';

// const defaultLabelOptions = ['noise', 'MUA', 'artifact', 'accept', 'reject'];

// const metricPlugins: MetricPlugin[] = Object.values(pluginComponents)
//                             .filter(plugin => {
//                                 const p = plugin as any
//                                 return (p.type === 'metricPlugin')
//                             })
//                             .map(plugin => {
//                                 return plugin as MetricPlugin
//                             })

type Status = 'waiting' | 'completed' | 'executing' | 'error'

type MetricDataState = {[key: string]: {
    status: Status
    data: any | null
    error: string | null
}}

const initialMetricDataState: MetricDataState = {}

interface MetricDataAction {
    metricName: string
    status: Status
    data?: any
    error?: string
}

const updateMetricData = (state: MetricDataState, action: MetricDataAction | 'clear'): MetricDataState => {
    if (action === 'clear') return {}
    const { metricName, status, data, error } = action
    if (state[metricName] && state[metricName].status === 'completed') {
        console.warn(`Updating status of completed metric ${metricName}??`);
        return state;
    }
    return {
        ...state,
        [metricName]: {
            'status': status,
            'data': status === 'completed' ? data || null : null,
            'error': status === 'error' ? error || null : null
        }
    }
}

interface OwnProps {
    maxHeight?: number
    width?: number
}



const Units: React.FunctionComponent<SortingViewProps & OwnProps> = (props) => {
    const { sorting, recording, sortingInfo, selection, selectionDispatch, curation, width, height, snippetLen, sortingSelector, compareSorting } = props
    const [expandedTable, setExpandedTable] = useState(false)
    const [metrics, updateMetrics] = useReducer(updateMetricData, initialMetricDataState)
    const [previousRecording, setPreviousRecording] = useState<Recording | null>(null)

    useEffect(() => {
        if (previousRecording !== recording) {
            updateMetrics('clear')
            setPreviousRecording(recording)
        }
    }, [recording, previousRecording, setPreviousRecording, updateMetrics])

    const kacheryNode = useKacheryNode()
    const {channelName} = useChannel()


    const fetchMetric = useCallback(async (metric: SortingUnitMetricPlugin) => {
        const name = metric.name;

        if (name in metrics) {
            return
        }

        // TODO: FIXME! THIS STATE IS NOT PRESERVED BETWEEN UNFOLDINGS!!!
        // TODO: May need to bump this up to the parent!!!
        // new request. Add state to cache, dispatch job, then update state as results come back.
        updateMetrics({metricName: metric.name, status: 'executing'})
        try {
            const data = await runPureCalculationTaskAsync(
                kacheryNode,
                metric.hitherFnName,
                {
                    sorting_object: sorting.sortingObject,
                    recording_object: recording.recordingObject,
                    snippet_len: snippetLen,
                    configuration: metric.metricFnParams
                },
                {
                    channelName
                }
            )
            updateMetrics({metricName: metric.name, status: 'completed', data})
        } catch (err) {
            console.error(err);
            updateMetrics({metricName: metric.name, status: 'error', error: err.message})
        }
    }, [kacheryNode, channelName, metrics, sorting.sortingObject, recording.recordingObject, snippetLen])

    const fetchComparisonMetric = useCallback(async (metric: SortingComparisonUnitMetricPlugin) => {
        if (!compareSorting) return
        const name = metric.name;

        if (name in metrics) {
            return
        }

        // TODO: FIXME! THIS STATE IS NOT PRESERVED BETWEEN UNFOLDINGS!!!
        // TODO: May need to bump this up to the parent!!!
        // new request. Add state to cache, dispatch job, then update state as results come back.
        updateMetrics({metricName: metric.name, status: 'executing'})
        try {
            const data = await runPureCalculationTaskAsync(
                kacheryNode,
                metric.hitherFnName,
                {
                    sorting_object: sorting.sortingObject,
                    compare_sorting_object: compareSorting.sortingObject,
                    sorting_selector: sortingSelector,
                    recording_object: recording.recordingObject,
                    snippet_len: snippetLen,
                    configuration: metric.metricFnParams
                },
                {
                    channelName
                }
            )
            updateMetrics({metricName: metric.name, status: 'completed', data})
        } catch (err) {
            console.error(err);
            updateMetrics({metricName: metric.name, status: 'error', error: err.message})
        }
    }, [kacheryNode, channelName, metrics, sorting.sortingObject, compareSorting, sortingSelector, recording.recordingObject, snippetLen])

    const plugins = usePlugins<LabboxPlugin>()
    useEffect(() => { 
        sortByPriority(sortingUnitMetricPlugins(plugins)).filter(p => (!p.disabled)).forEach(async mp => await fetchMetric(mp));
        sortByPriority(sortingComparisonUnitMetricPlugins(plugins)).filter(p => (!p.disabled)).forEach(async mp => await fetchComparisonMetric(mp));
    }, [plugins, metrics, fetchMetric, fetchComparisonMetric]);

    const metricsPlugins = useMemo(() => (sortingUnitMetricPlugins(plugins)), [plugins])
    const comparisonMetricsPlugins = useMemo(() => (sortingComparisonUnitMetricPlugins(plugins)), [plugins])

    let units = selection.visibleUnitIds || sortingInfo.unit_ids
    let showExpandButton = false;
    const totalNumUnits = units.length
    if ((!expandedTable) && (totalNumUnits > 30)) {
        units = units.slice(0, 30);
        showExpandButton = true;
    }

    const selectedUnitIds = useMemo(() => selection.selectedUnitIds || [], [selection.selectedUnitIds])
    const unitMetricsUri = useMemo(() => (sorting.unitMetricsUri), [sorting.unitMetricsUri])

    return (
        <div style={{width: width || 300}}>
            <Paper style={{maxHeight: props.maxHeight, overflow: 'auto'}}>
                <UnitsTable 
                    sortingUnitMetrics={metricsPlugins}
                    sortingComparisonUnitMetrics={comparisonMetricsPlugins}
                    units={units}
                    metrics={metrics}
                    selectedUnitIds={selectedUnitIds}
                    selectionDispatch={selectionDispatch}
                    unitMetricsUri={unitMetricsUri}
                    compareSorting={compareSorting}
                    curation={curation}
                    height={height}
                    sortingSelector={sortingSelector}
                />
                {
                    showExpandButton && (
                        <Button onClick={() => {setExpandedTable(true)}}>Show all {totalNumUnits} units</Button>
                    )
                }
            </Paper>
            {/* {
                (!readOnly) && (
                    <div>
                        <MultiComboBox
                            id="label-selection"
                            label='Choose labels'
                            placeholder='Add label'
                            onSelectionsChanged={(event: any, value: any) => setActiveOptions(value)}
                            options={labelOptions}
                        />
                        <Button onClick={() => handleApplyLabels(selectedRowKeys, activeOptions)}>Apply selected labels</Button>
                        <Button onClick={() => handlePurgeLabels(selectedRowKeys, activeOptions)}>Remove selected labels</Button>
                    </div>
                )
            } */}
        </div>
    );
}

export default Units