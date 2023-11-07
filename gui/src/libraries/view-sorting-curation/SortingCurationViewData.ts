import { validateObject } from "../core-utils"
import { isEqualTo } from "../core-utils"

export type SortingCurationViewData = {
    type: 'SortingCuration'
}

export const isSortingCurationViewData = (x: any): x is SortingCurationViewData => {
    return validateObject(x, {
        type: isEqualTo('SortingCuration')
    })
}