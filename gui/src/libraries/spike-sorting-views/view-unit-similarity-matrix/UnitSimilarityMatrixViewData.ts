import { validateObject } from "../../core-utils"
import { isArrayOf, isEqualTo, isNumber, isOneOf, isString, optional } from "../../core-utils"

export type UnitSimilarityMatrixViewData = {
    type: 'UnitSimilarityMatrix'
    unitIds: (number | string)[]
    similarityScores: {
        unitId1: number | string,
        unitId2: number | string,
        similarity: number
    }[]
    range?: [number, number]
}

export const isUnitSimilarityMatrixViewData = (x: any): x is UnitSimilarityMatrixViewData => {
    return validateObject(x, {
        type: isEqualTo('UnitSimilarityMatrix'),
        unitIds: isArrayOf(isOneOf([isNumber, isString])),
        similarityScores: isArrayOf(y=> (validateObject(y, {
            unitId1: isOneOf([isNumber, isString]),
            unitId2: isOneOf([isNumber, isString]),
            similarity: isNumber
        }))),
        range: optional(isArrayOf(isNumber))
    })
}