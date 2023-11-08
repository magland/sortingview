import { validateObject } from "../../core-utils"
import { isArrayOf, isBoolean, isEqualTo, isNumber, isOneOf, isString, optional } from "../../core-utils"

type AverageWaveformData = {
    unitId: number | string
    channelIds: (number | string)[]
    waveform: number[][]
    waveformStdDev?: number[][]
    waveformPercentiles?: (number[][])[]
}

export const isAverageWaveformData = (x: any): x is AverageWaveformData => {
    return validateObject(x, {
        unitId: isOneOf([isNumber, isString]),
        channelIds: isArrayOf(isOneOf([isNumber, isString])),
        waveform: () => (true),
        waveformStdDev: optional(() => (true)),
        waveformPercentiles: optional(() => (true))
    }, {allowAdditionalFields: true})
}

export type AverageWaveformsViewData = {
    type: 'AverageWaveforms'
    averageWaveforms: AverageWaveformData[]
    samplingFrequency?: number
    noiseLevel?: number
    channelLocations?: {[key: string]: number[]}
    showReferenceProbe?: boolean
}

export const isAverageWaveformsViewData = (x: any): x is AverageWaveformsViewData => {
    return validateObject(x, {
        type: isEqualTo('AverageWaveforms'),
        averageWaveforms: isArrayOf(isAverageWaveformData),
        samplingFrequency: optional(isNumber),
        noiseLevel: optional(isNumber),
        channelLocations: optional(() => (true)),
        showReferenceProbe: optional(isBoolean)
    }, {allowAdditionalFields: true})
}