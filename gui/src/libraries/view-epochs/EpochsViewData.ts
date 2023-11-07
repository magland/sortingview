import { validateObject } from "../core-utils"
import { isArrayOf, isEqualTo, isNumber, isString } from "../core-utils"

export type EpochData = {
    startTime: number
    endTime: number
    label: string
}

export type EpochsViewData = {
    type: 'Epochs'
    epochs: EpochData[]
}

export const isEpochsViewData = (x: any): x is EpochsViewData => {
    const isEpochData = (y: any) => {
        return validateObject(y, {
            startTime: isNumber,
            endTime: isNumber,
            label: isString
        })
    }
    return validateObject(x, {
        type: isEqualTo('Epochs'),
        epochs: isArrayOf(isEpochData)
    })
}