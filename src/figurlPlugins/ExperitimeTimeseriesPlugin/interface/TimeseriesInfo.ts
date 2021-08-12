export interface ChannelPropertiesInterface {
    location: number[]
}

export type TimeseriesInfo = {
    uri: string
    object: any
    channelNames: string[]
    numSamples: number
    startTime: number
    endTime: number
    type: 'continuous' | 'discrete'
    samplingFrequency: number
    noiseLevel?: number
    channelProperties?: {[key: string]: ChannelPropertiesInterface}
}