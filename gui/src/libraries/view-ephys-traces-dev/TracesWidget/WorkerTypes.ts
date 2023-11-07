export type TracesDataChunk = {
    chunkIndex: number
    data: (Int16Array | Float32Array)[]
}

export type SortingUnits = {
    units: {
        unitId: string | number
        color: string
        peakChannelId?: string | number
        spikeFrames: number[]
    }[]
}

export type Opts = {
    chunkSizeInFrames: number
    canvasWidth: number
    canvasHeight: number
    margins: {left: number, right: number, top: number, bottom: number}
    visibleStartTimeSec: number
    visibleEndTimeSec: number
    channels: {
        channelId: string | number
        offset: number
        scale: number
    }[]
    samplingFrequency: number
    zoomInRequired: boolean
    mode: 'traces' | 'heatmap'
    amplitudeScaleFactor: number
}

export type SpikeMarkerLocation = {
    rect: {x: number, y: number, w: number, h: number}
    unitId: string | number
}