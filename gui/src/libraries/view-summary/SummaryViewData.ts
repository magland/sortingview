import { validateObject } from "../core-utils"
import { isString, isArrayOf, isEqualTo, isNumber } from "../core-utils"


export type SummaryViewData = {
    type: 'Summary'
    recordingDescription: string
    sortingDescription: string
    recordingObject: any
    sortingObject: any
    unitIds: number[]
    channelIds: number[]
    samplingFrequency: number
    numFrames: number
    numSegments: number
    channelLocations: number[][]
    noiseLevel: number
}

export const isSummaryViewData = (x: any): x is SummaryViewData => {
    return validateObject(x, {
        type: isEqualTo('Summary'),
        recordingDescription: isString,
        sortingDescription: isString,
        recordingObject: () => (true),
        sortingObject: () => (true),
        unitIds: isArrayOf(isNumber),
        channelIds: isArrayOf(isNumber),
        samplingFrequency: isNumber,
        numFrames: isNumber,
        numSegments: isNumber,
        channelLocations: () => (true),
        noiseLevel: isNumber
    }, {allowAdditionalFields: true})
}