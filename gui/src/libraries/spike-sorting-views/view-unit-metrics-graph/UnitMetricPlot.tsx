import { FunctionComponent } from "react";
import UnitMetricHistogram from "./UnitMetricHistogram";
import UnitMetricScatterPlot from "./UnitMetricScatterPlot";
import { UMGMetric, UMGUnit } from "./UnitMetricsGraphViewData";

export type UnitMetricPlotProps = {
    type: 'histogram' | 'scatter' | 'bottom-label' | 'left-label'
    metric1?: UMGMetric
    metric2?: UMGMetric
    metric1Range?: {min: number, max: number}
    metric2Range?: {min: number, max: number}
    units: UMGUnit[]
    selectedUnitIds: Set<number | string>
    setSelectedUnitIds: (unitIds: (string | number)[]) => void
    numHistogramBins?: number
    onZoomToRect?: (r: {x: number, y: number, width: number, height: number}) => void
    width: number
    height: number
}

const UnitMetricPlot: FunctionComponent<UnitMetricPlotProps> = ({type, metric1, metric2, metric1Range, metric2Range, units, selectedUnitIds, setSelectedUnitIds, numHistogramBins, onZoomToRect, width, height}) => {
    if (type === 'histogram') {
        if (!metric1) throw Error('Unexpected: metric1 not defined')
        return (
            <UnitMetricHistogram
                metric={metric1}
                metricRange={metric1Range}
                units={units}
                selectedUnitIds={selectedUnitIds}
                setSelectedUnitIds={setSelectedUnitIds}
                numBins={numHistogramBins}
                onZoomToRect={onZoomToRect}
                width={width}
                height={height}
            />
        )
    }
    else if (type === 'scatter') {
        if (!metric1) throw Error('Unexpected: metric1 not defined')
        if (!metric2) throw Error('Unexpected: metric2 not defined')
        return (
            <UnitMetricScatterPlot
                metric1={metric1}
                metric2={metric2}
                metric1Range={metric1Range}
                metric2Range={metric2Range}
                units={units}
                selectedUnitIds={selectedUnitIds}
                setSelectedUnitIds={setSelectedUnitIds}
                onZoomToRect={onZoomToRect}
                width={width}
                height={height}
            />
        )
    }
    else if (type === 'bottom-label') {
        return (
            <div style={{width: width, textAlign: 'center'}}>{metric1?.label || <span>&nbsp;</span>}</div>
        )
    }
    else if (type === 'left-label') {
        return (
            <div style={{width, height, overflow: 'hidden', writingMode: 'vertical-lr', transform: 'rotate(-180deg)', textAlign: 'center'}}>{metric1?.label || <span>&nbsp;</span>}</div>
        )
    }
    else {
        throw Error(`Unexpected type: ${type}`)
    }
}

export default UnitMetricPlot