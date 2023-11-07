import { isString, validateObject } from "../core-utils"
import { isArrayOf, isEqualTo, isNumber, isOneOf, optional } from "../core-utils"

type CVViewData = {
    label: string
    type: string
    figureDataSha1?: string // old
    figureDataUri?: string // new
    defaultHeight?: number
}

const isCVViewData = (x: any): x is CVViewData => {
    return validateObject(x, {
        label: isString,
        type: isString,
        figureDataSha1: optional(isString), // old
        figureDataUri: optional(isString), // new
        defaultHeight: optional(isNumber)
    })
}

export type CompositeViewData = {
    type: 'Composite'
    layout: 'default'
    views: CVViewData[]
}

export const isCompositeViewData = (x: any): x is CompositeViewData => {
    return validateObject(x, {
        type: isEqualTo('Composite'),
        layout: isOneOf([isEqualTo('default')]),
        views: isArrayOf(isCVViewData)
    })
}