import { isString, validateObject } from "../core-utils"
import { isArrayOf, isEqualTo, isNumber, optional } from "../core-utils"

type MTPanelData = {
    label: string
    type: string
    figureDataSha1?: string // old
    figureDataUri?: string // new
    relativeHeight?: number
}

const isMTPanelData = (x: any): x is MTPanelData => {
    return validateObject(x, {
        label: isString,
        type: isString,
        figureDataSha1: optional(isString),
        figureDataUri: optional(isString),
        relativeHeight: optional(isNumber)
    })
}

export type MultiTimeseriesViewData = {
    type: 'MultiTimeseries'
    panels: MTPanelData[]
}

export const isMultiTimeseriesViewData = (x: any): x is MultiTimeseriesViewData => {
    return validateObject(x, {
        type: isEqualTo('MultiTimeseries'),
        panels: isArrayOf(isMTPanelData)
    })
}