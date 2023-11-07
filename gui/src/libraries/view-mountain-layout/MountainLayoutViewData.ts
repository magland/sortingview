import { isString, validateObject } from "../core-utils"
import { isArrayOf, isEqualTo, optional } from "../core-utils"

export type MLViewData = {
    label: string
    type: string
    figureDataSha1?: string // old
    figureDataUri?: string // new
}

const isMLViewData = (x: any): x is MLViewData => {
    return validateObject(x, {
        label: isString,
        type: isString,
        figureDataSha1: optional(isString), // old
        figureDataUri: optional(isString) // new
    }, {allowAdditionalFields: true})
}

export type MountainLayoutViewData = {
    type: 'MountainLayout'
    views: MLViewData[]
    controls?: MLViewData[]
    sortingCurationUri?: string
}

export const isMountainLayoutViewData = (x: any): x is MountainLayoutViewData => {
    return validateObject(x, {
        type: isEqualTo('MountainLayout'),
        views: isArrayOf(isMLViewData),
        controls: optional(isArrayOf(isMLViewData)),
        sortingCurationUri: optional(isString)
    }, {allowAdditionalFields: true})
}