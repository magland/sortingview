import { validateObject } from "../../core-utils"
import { isArrayOf, isOneOf, isString, isEqualTo, isNumber, optional, isBoolean } from "../../core-utils"
import { HighlightIntervalSet, isHighlightIntervalSet } from '../../timeseries-views'

type RPPlotData = {
    unitId: number | string
    spikeTimesSec: number[]
}

const isRPPlotData = (x: any): x is RPPlotData => {
    return validateObject(x, {
        unitId: isOneOf([isNumber, isString]),
        spikeTimesSec: isArrayOf(isNumber)
    })
}

export type RasterPlotViewData = {
    type: 'RasterPlot'
    startTimeSec: number
    endTimeSec: number
    plots: RPPlotData[]
    highlightIntervals?: HighlightIntervalSet[]
    hideToolbar?: boolean
}

export const isRasterPlotViewData = (x: any): x is RasterPlotViewData => {
    return validateObject(x, {
        type: isEqualTo('RasterPlot'),
        startTimeSec: isNumber,
        endTimeSec: isNumber,
        plots: isArrayOf(isRPPlotData),
        highlightIntervals: optional(isArrayOf(isHighlightIntervalSet)),
        hideToolbar: optional(isBoolean)
    })
}