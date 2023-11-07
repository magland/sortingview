import { isEqualTo, validateObject, optional, isArrayOf, isString } from "../../core-utils"

export type SortingCuration2ViewData = {
    type: 'SortingCuration2'
    labelChoices?: string[]
}

export const isSortingCuration2ViewData = (x: any): x is SortingCuration2ViewData => {
    return validateObject(x, {
        type: isEqualTo('SortingCuration2'),
        labelChoices: optional(isArrayOf(isString))
    })
}