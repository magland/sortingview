import { isNumber, validateObject } from "../../../core-utils"
import { isArrayOf, isEqualTo, isString, optional } from "../../../core-utils"

export type MLViewData = {
    label: string
    type: string
    figureDataSha1?: string // old
    figureDataUri?: string // new
    controlHeight?: number
}

const isMLViewData = (x: any): x is MLViewData => {
    return validateObject(x, {
        label: isString,
        type: isString,
        figureDataSha1: optional(isString), // old
        figureDataUri: optional(isString), // new
        controlHeight: optional(isNumber)
    }, {allowAdditionalFields: true})
}

export type MountainLayout2ViewData = {
    type: 'MountainLayout'
    views: MLViewData[]
    controls?: MLViewData[]
    sortingCurationUri?: string
}

export const isMountainLayout2ViewData = (x: any): x is MountainLayout2ViewData => {
    return validateObject(x, {
        type: isEqualTo('MountainLayout'),
        views: isArrayOf(isMLViewData),
        controls: optional(isArrayOf(isMLViewData)),
        sortingCurationUri: optional(isString)
    }, {allowAdditionalFields: true})
}