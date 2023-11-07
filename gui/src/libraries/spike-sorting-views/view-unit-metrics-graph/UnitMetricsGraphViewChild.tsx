import { PGPlot, PlotGrid, Splitter, VerticalScrollView } from '../../core-views';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { determinePlotSizeForSquareMatrixGrid, idToNum, INITIALIZE_UNITS, sortIds, useSelectedUnitIds } from '..';
import { useUnitMetricSelection } from '../context-unit-metrics-selection';
import { ToolbarItem, ViewToolbar } from '../ViewToolbar';
import { viewToolbarWidth } from '../ViewToolbar/ViewToolbar';
import UnitMetricPlot, { UnitMetricPlotProps } from './UnitMetricPlot';
import { UMGMetric, UnitMetricsGraphViewData } from './UnitMetricsGraphViewData';

type Props = {
    data: UnitMetricsGraphViewData
    width: number
    height: number
}

type MetricRanges = {[key: string]: {min: number, max: number} | undefined}

const UnitMetricsGraphViewChild: FunctionComponent<Props> = ({data, width, height}) => {
    const {units, metrics} = data
    const {selectedUnitIds, unitIdSelectionDispatch} = useSelectedUnitIds()
    const {selectedUnitMetrics} = useUnitMetricSelection()
    const [plotBoxScaleFactor, setPlotBoxScaleFactor] = useState<number>(1)
    const [numHistogramBins, setNumHistogramBins] = useState<number>(10)
    const [metricRanges, setMetricRanges] = useState<MetricRanges>({})

    const unitsSorted = useMemo(() => (
        units.sort((u1, u2) => {
            if ((selectedUnitIds.has(u1.unitId)) && (!selectedUnitIds.has(u2.unitId))) {
                return 1
            }
            else if ((!selectedUnitIds.has(u1.unitId)) && (selectedUnitIds.has(u2.unitId))) {
                return -1
            }
            else return idToNum(u1.unitId) - idToNum(u2.unitId)
        })
    ), [units, selectedUnitIds])

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_UNITS, newUnitOrder: sortIds(unitsSorted.map(u => (u.unitId))) })
    }, [unitsSorted, unitIdSelectionDispatch])

    const customToolbarActions = useMemo(() => {
        const boxSizeActions: ToolbarItem[] = selectedUnitMetrics.length === 0 ? [
            {
                type: 'text',
                content: 'Size',
                title: ''
            },
            {
                type: 'button',
                callback: () => setPlotBoxScaleFactor(s => (s * 1.3)),
                title: 'Increase box size',
                icon: <FaPlus />
            },
            {
                type: 'button',
                callback: () => setPlotBoxScaleFactor(s => (s / 1.3)),
                title: 'Decrease box size',
                icon: <FaMinus />
            }
        ] : []
        const numBinsActions: ToolbarItem[] = [
            {
                type: 'text',
                content: '# bins',
                title: ''
            },
            {
                type: 'button',
                callback: () => setNumHistogramBins(x => (x + 5)),
                title: 'Increase num. histogram bins',
                icon: <FaPlus />
            },
            {
                type: 'button',
                callback: () => setNumHistogramBins(x => Math.max(5, (x - 5))),
                title: 'Decrease num. histogram bins',
                icon: <FaMinus />
            }
        ]
        const resetZoomAction = {
            type: 'button',
            callback: () => setMetricRanges({}),
            title: 'Reset zoom',
            text: 'RZ'
        }
        return [
            ...(boxSizeActions),
            {type: 'divider'},
            ...numBinsActions,
            {type: 'divider'},
            resetZoomAction
        ]
    }, [selectedUnitMetrics.length])

    const TOOLBAR_WIDTH = viewToolbarWidth // hard-coded for now

    const plots: PGPlot[] = useMemo(() => {
        const setSelectedUnitIds = (unitIds: (string | number)[]) => {
            unitIdSelectionDispatch({
                type: 'SET_SELECTION',
                incomingSelectedUnitIds: unitIds
            })
        }
        if (selectedUnitMetrics.length === 0) {
            return metrics.map(metric => {
                const props: UnitMetricPlotProps = {
                    type: 'histogram',
                    metric1: metric,
                    metric2: metric,
                    metric1Range: metricRanges[metric.key],
                    metric2Range: metricRanges[metric.key],
                    units: unitsSorted,
                    width: 400 * plotBoxScaleFactor,
                    height: 400 * plotBoxScaleFactor,
                    numHistogramBins,
                    selectedUnitIds,
                    setSelectedUnitIds,
                    onZoomToRect: (r: {x: number, y: number, width: number, height: number}) => {
                        setMetricRanges({
                            ...metricRanges,
                            [metric.key]: {min: r.x, max: r.x + r.width}
                        })
                    }
                }
                const ret: PGPlot = {
                    key: metric.key,
                    label: metric.label,
                    unitId: '',
                    labelColor: 'black',
                    props
                }
                return ret
            })
        }
        else {
            const bottomLabelHeight = 30
            const leftLabelWidth = 30
            const {plotWidth, plotHeight} = determinePlotSizeForSquareMatrixGrid(width - TOOLBAR_WIDTH - leftLabelWidth - 10, height - bottomLabelHeight - 10, selectedUnitMetrics.length)
            const ret: PGPlot[] = []
            for (let m1 of selectedUnitMetrics) {
                const metric1: UMGMetric | undefined = metrics.filter(x => (x.key === m1))[0]
                {
                    const props: UnitMetricPlotProps = {
                        type: 'left-label',
                        metric1: metric1,
                        metric2: metric1,
                        units: unitsSorted,
                        numHistogramBins,
                        width: leftLabelWidth,
                        height: plotHeight,
                        selectedUnitIds,
                        setSelectedUnitIds
                    }
                    ret.push({
                        key: `left-label-${m1}`,
                        label: undefined,
                        unitId: '',
                        labelColor: 'black',
                        props,
                        hideBorderColor: true
                    })
                }
                for (let m2 of selectedUnitMetrics) {
                    const metric2: UMGMetric | undefined = metrics.filter(x => (x.key === m2))[0]
                    if (metric1 && metric2) {
                        const props: UnitMetricPlotProps = {
                            type: m1 === m2 ? 'histogram': 'scatter',
                            metric1: metric2,
                            metric2: metric1,
                            metric1Range: metricRanges[metric2.key],
                            metric2Range: metricRanges[metric1.key],
                            units: unitsSorted,
                            numHistogramBins,
                            width: plotWidth,
                            height: plotHeight,
                            selectedUnitIds,
                            setSelectedUnitIds,
                            onZoomToRect: (r: {x: number, y: number, width: number, height: number}) => {
                                if (m1 !== m2) {
                                    setMetricRanges({
                                        ...metricRanges,
                                        [metric2.key]: {min: r.x, max: r.x + r.width},
                                        [metric1.key]: {min: r.y, max: r.y + r.height}
                                    })
                                }
                                else {
                                    setMetricRanges({
                                        ...metricRanges,
                                        [metric1.key]: {min: r.x, max: r.x + r.width},
                                    })
                                }
                            }
                        }
                        ret.push({
                            key: `${m2}-${m1}`,
                            // label: props.type === 'histogram' ? m1 : `${m1} vs. ${m2}`,
                            label: props.type === 'histogram' ? m1 : undefined,
                            unitId: '',
                            labelColor: 'black',
                            props
                        })
                    }
                }
            }
            {
                const props: UnitMetricPlotProps = {
                    type: 'bottom-label',
                    metric1: undefined,
                    metric2: undefined,
                    units: unitsSorted,
                    numHistogramBins,
                    width: leftLabelWidth,
                    height: bottomLabelHeight,
                    selectedUnitIds,
                    setSelectedUnitIds
                }
                ret.push({
                    key: `left-bottom-label`,
                    label: undefined,
                    unitId: '',
                    labelColor: 'black',
                    props,
                    hideBorderColor: true
                })
            }
            for (let m of selectedUnitMetrics) {
                const metric: UMGMetric | undefined = metrics.filter(x => (x.key === m))[0]
                const props: UnitMetricPlotProps = {
                    type: 'bottom-label',
                    metric1: metric,
                    metric2: metric,
                    units: unitsSorted,
                    numHistogramBins,
                    width: plotWidth,
                    height: bottomLabelHeight,
                    selectedUnitIds,
                    setSelectedUnitIds
                }
                ret.push({
                    key: `bottom-label-${m}`,
                    // label: props.type === 'histogram' ? m1 : `${m1} vs. ${m2}`,
                    label: undefined,
                    unitId: '',
                    labelColor: 'black',
                    props,
                    hideBorderColor: true
                })
            }
            return ret
        }
    }, [metrics, selectedUnitIds, unitsSorted, plotBoxScaleFactor, selectedUnitMetrics, numHistogramBins, width, height, unitIdSelectionDispatch, metricRanges, TOOLBAR_WIDTH])

    return (
        <div>
            <Splitter
                width={width}
                height={height}
                initialPosition={TOOLBAR_WIDTH}
                adjustable={false}
            >
                <ViewToolbar
                    width={TOOLBAR_WIDTH}
                    height={height}
                    customActions={customToolbarActions}
                />
                <VerticalScrollView width={0} height={0} disableScroll={selectedUnitMetrics.length > 0 ? true : false}>
                    <PlotGrid
                        plots={plots}
                        plotComponent={UnitMetricPlot}
                        numPlotsPerRow={selectedUnitMetrics.length === 0 ? undefined : selectedUnitMetrics.length + 1}
                    />
                </VerticalScrollView>
            </Splitter>
        </div>
    )
}

export default UnitMetricsGraphViewChild