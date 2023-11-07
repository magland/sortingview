import { validateObject } from "../../core-utils"
import { isArrayOf, isEqualTo, isNumber, isOneOf, isString } from "../../core-utils"

export type ConfusionMatrixViewData = {
    type: 'ConfusionMatrix'
    sorting1UnitIds: (number | string)[]
    sorting2UnitIds: (number | string)[]
    unitEventCounts: {
        unitId: number | string,
        count: number
    }[]
    matchingUnitEventCounts: {
        unitId1: number | string,
        unitId2: number | string,
        count: number
    }[]
}

export const isConfusionMatrixViewData = (x: any): x is ConfusionMatrixViewData => {
    return validateObject(x, {
        type: isEqualTo('ConfusionMatrix'),
        sorting1UnitIds: isArrayOf(isOneOf([isNumber, isString])),
        sorting2UnitIds: isArrayOf(isOneOf([isNumber, isString])),
        unitEventCounts: isArrayOf(y=> (validateObject(y, {
            unitId: isOneOf([isNumber, isString]),
            count: isNumber
        }))),
        matchingUnitEventCounts: isArrayOf(y=> (validateObject(y, {
            unitId1: isOneOf([isNumber, isString]),
            unitId2: isOneOf([isNumber, isString]),
            count: isNumber
        })))
    })
}