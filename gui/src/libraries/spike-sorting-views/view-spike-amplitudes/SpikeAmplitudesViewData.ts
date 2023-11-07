import { validateObject } from "../../core-utils"
import { isArrayOf, isBoolean, isEqualTo, isNumber, optional, isOneOf, isString } from "../../core-utils"

type SAUnitData = {
    unitId: number | string
    spikeTimesSec: number[]
    spikeAmplitudes: number[]
}

const isSAUnitData = (x: any): x is SAUnitData => {
    return validateObject(x, {
        unitId: isOneOf([isNumber, isString]),
        spikeTimesSec: isArrayOf(isNumber),
        spikeAmplitudes: isArrayOf(isNumber),
    })
}

export type SpikeAmplitudesViewData = {
    type: 'SpikeAmplitudes'
    startTimeSec: number
    endTimeSec: number
    units: SAUnitData[]
    hideUnitSelector?: boolean
    hideToolbar?: boolean
}

export const isSpikeAmplitudesViewData = (x: any): x is SpikeAmplitudesViewData => {
    return validateObject(x, {
        type: isEqualTo('SpikeAmplitudes'),
        startTimeSec: isNumber,
        endTimeSec: isNumber,
        units: isArrayOf(isSAUnitData),
        hideUnitSelector: optional(isBoolean),
        hideToolbar: optional(isBoolean)
    })
}