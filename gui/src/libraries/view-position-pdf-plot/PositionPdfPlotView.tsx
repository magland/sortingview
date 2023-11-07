import { FunctionComponent, useMemo } from 'react'
import { TimeseriesLayoutOpts } from 'View'
import { PositionPdfPlotViewData } from './PositionPdfPlotViewData'
import PositionPdfPlotWidget, { FetchSegmentQuery } from './PositionPdfPlotWidget'

type Props = {
    data: PositionPdfPlotViewData
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
    width: number
    height: number
}

const segmentSize = 10000
const multiscaleFactor = 3

// Helper function, could be moved somewhere more general
// Still assumes the underlying array is not ragged
const vectorAverage = (vectorSet: number[][], startIndex: number, chunkLength: number): number[] => {
    // if startIndex + chunkLength exceeds the available, slice() will just return up to the end of the array
    const slice = vectorSet.slice(startIndex, startIndex + chunkLength)
    // does component-wise sum of vectors
    const componentSummation = (total: number[], vector: number[]) => {
        vector.forEach((component, index) => total[index] += component)
        return total
    }
    // reduce applies the sum to the vector list, starting from an appropriately-sized array of 0s
    const summedVectors = slice.reduce(componentSummation, Array(slice[0].length).fill(0))
    return summedVectors.map(component => component / slice.length)
}

const downsample = (data: number[][], downsampleFactor: number, startIndex: number = 0): number[][] => {
    const downsampled: number[][] = []
    // This downsamples from a starting index to the end of the data set.
    // If you wanted to stop early, could just slice the incoming data array to begin with
    const iterations = Math.ceil(data.length / downsampleFactor - startIndex)
    for (let i = 0; i < iterations; i++) {
        downsampled.push(vectorAverage(data, (startIndex + i) * downsampleFactor, downsampleFactor))
    }
    return downsampled
}

const PositionPdfPlotView: FunctionComponent<Props> = ({data, timeseriesLayoutOpts, width, height}) => {
    const numPositions = data.pdf[0].length
    const fetchSegment = useMemo(() => (async (query: FetchSegmentQuery) => {
        return downsample(data.pdf, query.downsampleFactor, query.segmentNumber * query.segmentSize)
    }), [data.pdf])

    const endTimeSec = data.startTimeSec + data.pdf.length / data.samplingFrequency

    return (
        <PositionPdfPlotWidget
            startTimeSec={data.startTimeSec}
            endTimeSec={endTimeSec}
            samplingFrequency={data.samplingFrequency}
            fetchSegment={fetchSegment}
            numPositions={numPositions}
            segmentSize={segmentSize}
            multiscaleFactor={multiscaleFactor}
            timeseriesLayoutOpts={timeseriesLayoutOpts}
            width={width}
            height={height}
        />
    )
}

export default PositionPdfPlotView