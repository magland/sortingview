import { FunctionComponent, useCallback, useMemo } from "react";
import { idToNum } from "..";
import { BarPlot, BarPlotBar, BarPlotTick, BarPlotVerticalLine } from "../component-bar-plot";
import { getUnitColor } from "../view-units-table/unitColors";
import determineTickLocationsMsec from "./determineTickLocationsMsec";
import { UMGMetric, UMGUnit } from "./UnitMetricsGraphViewData";

export type UnitMetricHistogramProps = {
    metric: UMGMetric
    metricRange?: {min: number, max: number}
    units: UMGUnit[]
    selectedUnitIds: Set<number | string>
    setSelectedUnitIds: (unitIds: (string | number)[]) => void
    numBins?: number
    onZoomToRect?: (r: {x: number, y: number, width: number, height: number}) => void
    width: number
    height: number
}

const UnitMetricHistogram: FunctionComponent<UnitMetricHistogramProps> = ({metric, metricRange, units, selectedUnitIds, setSelectedUnitIds, numBins, onZoomToRect, width, height}) => {
    const {bars, ticks, verticalLines} = useMemo(() => {
        const values = units.map(unit => (unit.values[metric.key])).filter(a => (a !== undefined)).map(a => (a as number))
        const valuesSelected = units.filter(u => (selectedUnitIds.has(u.unitId))).map(unit => (unit.values[metric.key])).filter(a => (a !== undefined)).map(a => (a as number))
        const unitIdsSelected = units.filter(u => (selectedUnitIds.has(u.unitId))).map(unit => ({unitId: unit.unitId, value: unit.values[metric.key]})).filter(a => (a.value !== undefined)).map(a => (a.unitId))
        const colorsSelected = unitIdsSelected.map(u => (getUnitColor(idToNum(u))))
        return createHistogramBars(values, valuesSelected, colorsSelected, numBins || 10)
    }, [units, metric, selectedUnitIds, numBins])
    const handleSelectRect = useCallback((r: {x: number, y: number, width: number, height: number}, selectedBarKeys: (string | number)[], {ctrlKey, shiftKey, xMin, xMax}: {ctrlKey: boolean, shiftKey: boolean, xMin: number, xMax: number}) => {
        if (shiftKey) {
            onZoomToRect && onZoomToRect({x: xMin, y: r.y, width: xMax - xMin, height: r.height})
            return
        }
        if (selectedBarKeys.length === 0) return
        const selectedBars: BarPlotBar[] = []
        for (let i of selectedBarKeys) {
            const bar = bars[i as number]
            selectedBars.push(bar)
        }
        const x1 = Math.min(...selectedBars.map(b => (b.xStart)))
        const x2 = Math.max(...selectedBars.map(b => (b.xEnd)))
        const ids: (number | string)[] = []
        for (let u of units) {
            const v = u.values[metric.key]
            if (v !== undefined) {
                if ((x1 <= v) && (v <= x2)) {
                    ids.push(u.unitId)
                }
            }
        }
        if (ctrlKey || shiftKey) {
            setSelectedUnitIds([...new Set([...selectedUnitIds, ...ids])])
        }
        else {
            setSelectedUnitIds(ids)
        }
    }, [bars, metric, selectedUnitIds, setSelectedUnitIds, units, onZoomToRect])
    return (
        <BarPlot
            width={width}
            height={height}
            bars={bars}
            range={metricRange}
            ticks={ticks}
            verticalLines={verticalLines}
            onSelectRect={handleSelectRect}
        />
    )
}

const createHistogramBars = (values: number[], valuesSelected: number[], colorsSelected: string[], numBins: number): {bars: BarPlotBar[], ticks: BarPlotTick[], verticalLines: BarPlotVerticalLine[]} => {
    if (values.length === 0) return {bars: [], ticks: [], verticalLines: []}
    let min = Math.min(...values)
    let max = Math.max(...values)
    if (max <= min) return {bars: [], ticks: [], verticalLines: []}
    min -= (max - min) / numBins / 2
    max += (max - min) / numBins / 2
    const counts: number[] = []
    for (let i = 0; i < numBins; i++) counts.push(0)
    for (let value of values) {
        const i = Math.min(Math.floor((value - min) / (max - min) * numBins), numBins - 1)
        counts[i] ++
    }
    const countsSelected: number[] = []
    for (let i = 0; i < numBins; i++) countsSelected.push(0)
    for (let value of valuesSelected) {
        const i = Math.min(Math.floor((value - min) / (max - min) * numBins), numBins - 1)
        countsSelected[i] ++
    }

    const verticalLines: BarPlotVerticalLine[] = []
    valuesSelected.forEach((value, i) => {
        verticalLines.push({
            x: value,
            color: colorsSelected[i]
        })
    })

    const tickLocations: number[] = determineTickLocations(min, max)
    const ticks: BarPlotTick[] = tickLocations.map(x => ({
        x,
        label: `${x}`
    }))
    
    return {
        bars: [
            ...counts.map((count, i) => {
                const bar: BarPlotBar = {
                    key: i,
                    xStart: min + i * (max - min) / numBins,
                    xEnd: min + (i + 1) * (max - min) / numBins,
                    height: count,
                    tooltip: '',
                    color: 'gray'
                }
                return bar
            }),
            // ...countsSelected.map((count, i) => {
            //     const bar: BarPlotBar = {
            //         key: i,
            //         xStart: min + i * (max - min) / numBins,
            //         xEnd: min + (i + 1) * (max - min) / numBins,
            //         height: count,
            //         tooltip: '',
            //         color: 'green'
            //     }
            //     return bar
            // })
        ],
        ticks,
        verticalLines
    }
}

const determineTickLocations = (min: number, max: number) => {
    const span = max - min
    if (span <= 0) return []
    let scale = 1
    while (span * scale < 100) {
        scale *= 10
    }
    while (span * scale >= 1000) {
        scale /= 10
    }
    return determineTickLocationsMsec(min * scale, max * scale).map(v => (v / scale))
}

export default UnitMetricHistogram