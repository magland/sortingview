import { ScatterPlot, ScatterPlotMarker } from '../component-scatter-plot';
import { FunctionComponent, useCallback, useMemo } from "react";
import { idToNum } from "..";
import { getUnitColor } from "../view-units-table/unitColors";
import { UMGMetric, UMGUnit } from "./UnitMetricsGraphViewData";

export type UnitMetricScatterPlotProps = {
    metric1: UMGMetric
    metric2: UMGMetric
    metric1Range?: {min: number, max: number}
    metric2Range?: {min: number, max: number}
    units: UMGUnit[]
    selectedUnitIds: Set<number | string>
    setSelectedUnitIds: (unitIds: (string | number)[]) => void
    onZoomToRect?: (r: {x: number, y: number, width: number, height: number}) => void
    width: number
    height: number
}

const UnitMetricScatterPlot: FunctionComponent<UnitMetricScatterPlotProps> = ({metric1, metric2, metric1Range, metric2Range, units, selectedUnitIds, setSelectedUnitIds, onZoomToRect, width, height}) => {
    const radius = 6
    const markers: ScatterPlotMarker[] = useMemo(() => {
        const ret: ScatterPlotMarker[] = []
        for (let unit of units) {
            const xValue = unit.values[metric1.key]
            const yValue = unit.values[metric2.key]
            if ((xValue !== undefined) && (yValue !== undefined)) {
                ret.push({
                    key: unit.unitId,
                    x: xValue,
                    y: yValue,
                    color: selectedUnitIds.has(unit.unitId) ? getUnitColor(idToNum(unit.unitId)) : 'lightgray',
                    radius,
                    tooltip: `Unit ${unit.unitId}`
                })
            }
        }
        return ret
    }, [units, metric1, metric2, selectedUnitIds])
    const handleSelectRect = useCallback((r: {x: number, y: number, width: number, height: number}, selectedMarkerIds: (string | number)[], {ctrlKey, shiftKey}: {ctrlKey: boolean, shiftKey: boolean}) => {
        if (shiftKey) {
            onZoomToRect && onZoomToRect(r)
            return
        }
        let selectedIds = selectedMarkerIds
        if (ctrlKey) {
            selectedIds = [...new Set([...selectedMarkerIds, ...selectedUnitIds])]
        }
        setSelectedUnitIds(selectedIds)
    }, [setSelectedUnitIds, selectedUnitIds, onZoomToRect])
    const handleClickPoint = useCallback((p: {x: number, y: number}, selectedMarkerKey: string | number | undefined, {ctrlKey, shiftKey}: {ctrlKey: boolean, shiftKey: boolean}) => {
        let selectedIds: (number | string)[]
        if ((ctrlKey) || (shiftKey)) {
            const x = new Set([...selectedUnitIds])
            if (selectedMarkerKey !== undefined) {
                if (x.has(selectedMarkerKey)) x.delete(selectedMarkerKey)
                else x.add(selectedMarkerKey)
            }
            selectedIds = [...x]
        }
        else {
            if (selectedMarkerKey === undefined) {
                selectedIds = []
            }
            else {
                selectedIds = [selectedMarkerKey]
            }
        }
        setSelectedUnitIds(selectedIds)
    }, [setSelectedUnitIds, selectedUnitIds])
    return (
        <ScatterPlot
            width={width}
            height={height}
            markers={markers}
            xRange={metric1Range}
            yRange={metric2Range}
            onSelectRect={handleSelectRect}
            onClickPoint={handleClickPoint}
        />
    )
}

// const rectangularRegionsIntersect2 = (r1: {x: number, y: number, width: number, height: number}, r2: {x: number, y: number, width: number, height: number}) => {
//     return rectangularRegionsIntersect(
//         {xmin: r1.x, ymin: r1.y, xmax: r1.x + r1.width, ymax: r1.y + r1.height},
//         {xmin: r2.x, ymin: r2.y, xmax: r2.x + r2.width, ymax: r2.y + r2.height}
//     )
// }

export default UnitMetricScatterPlot