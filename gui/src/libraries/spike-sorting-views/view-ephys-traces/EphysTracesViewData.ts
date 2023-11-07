import { isBoolean, isEqualTo, isString, optional, validateObject } from "../../core-utils"

export type EphysTracesViewData = {
    type: 'EphysTraces'
    format: 'spikeinterface.binary'
    uri: string
    hideToolbar?: boolean
}

export const isEphysTracesViewData = (x: any): x is EphysTracesViewData => {
    return validateObject(x, {
        type: isEqualTo('EphysTraces'),
        format: isEqualTo('spikeinterface.binary'),
        uri: isString,
        hideToolbar: optional(isBoolean)
    })
}