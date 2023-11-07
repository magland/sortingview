import { isArrayOf, isEqualTo, isNumber, isOneOf, isString, validateObject } from "../../core-utils"

export type UnitImagesViewData = {
    type: 'UnitImages'
    items: {
        unitId: string | number
        url: string
    }[]
    itemWidth: number
    itemHeight: number
}

export const isUnitImagesViewData = (x: any): x is UnitImagesViewData => {
    return validateObject(x, {
        type: isEqualTo('UnitImages'),
        items: isArrayOf(y => (validateObject(y, {
            unitId: isOneOf([isString, isNumber]),
            url: isString
        }))),
        itemWidth: isNumber,
        itemHeight: isNumber
    })
}