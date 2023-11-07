import { matrix, Matrix, multiply } from "mathjs";
import { useMemo } from "react";
import { DecodedPositionData, DecodedPositionFrame, DecodedPositionFramePx } from "./TrackPositionAnimationTypes";
import { computeTrackBinPixelDimensions } from "./TrackPositionAnimationView";

const nullDecodedData: DecodedPositionData = {
    type: 'DecodedPositionData',
    xmin: 0,
    binWidth: 0,
    xcount: 0,
    ymin: 0,
    binHeight: 0,
    ycount: 0,
    uniqueLocations: undefined,
    frameBounds: [],
    values: [],
    locations: []
}

type DecodedProbabilityLocationsMap = {
    [linearLocation: number]: number[]
}
type DecodedProbabilityCorners = {
    linearizedValue: number[]
    nativeXUlCorner: number[]
    nativeYUlCorner: number[]
}
const useUniqueDecodedUlLocations = (decodedData: DecodedPositionData | undefined): DecodedProbabilityCorners => {
    const { locations, uniqueLocations, xcount, binWidth, xmin, binHeight, ymin } = decodedData ? decodedData : nullDecodedData
    const mappedUlCorners = useMemo(() => {
        const uSet = uniqueLocations ? uniqueLocations : new Set(locations).values()
        const sortedLocations = [...uSet].sort()
        const nativeXs = sortedLocations.map(l => l % xcount)
        const nativeYs = sortedLocations.map(l => Math.floor(l / xcount))

        const centerToULCornerMatrix = matrix([[binWidth,    0  , -binWidth/2 + xmin],
                                               [  0   , binHeight,  binHeight/2 + ymin]])
        const augmentedNativeCenters = matrix([nativeXs, nativeYs, new Array(nativeYs.length).fill(1)])
        const nativeUlPoints = multiply(centerToULCornerMatrix, augmentedNativeCenters).valueOf() as number[][]
        return {
            linearizedValue: sortedLocations,
            nativeXUlCorner: nativeUlPoints[0],
            nativeYUlCorner: nativeUlPoints[1]
        }
    }, [locations, uniqueLocations, xcount, binWidth, xmin, binHeight, ymin])

    return mappedUlCorners
}

export const useProbabilityLocationsMap = (transform: Matrix, decodedData: DecodedPositionData | undefined): DecodedProbabilityLocationsMap => {
    const { binWidth, binHeight } = decodedData ? decodedData : nullDecodedData
    const uniqueNativeLocations = useUniqueDecodedUlLocations(decodedData)
    const linearPositionMap = useMemo(() => {
        const pixelRects = computeTrackBinPixelDimensions(transform, [uniqueNativeLocations.nativeXUlCorner, uniqueNativeLocations.nativeYUlCorner], binWidth, binHeight)
        const the_dict: DecodedProbabilityLocationsMap = {}
        uniqueNativeLocations.linearizedValue.forEach((linearizedValue, index) => {
            the_dict[linearizedValue] = pixelRects[index]
        })
        return the_dict
    }, [transform, uniqueNativeLocations, binWidth, binHeight])
    return linearPositionMap
}

export const useProbabilityFrames = (decodedData: DecodedPositionData | undefined): DecodedPositionFrame[] => {
    const { frameBounds, values, locations } = decodedData ? decodedData : nullDecodedData

    const frames = useMemo(() => {
        let frameStart = 0
        return frameBounds.map((nObservations) => {
            const valueSlice = values.slice(frameStart, frameStart + nObservations)
            const locationSlice = locations.slice(frameStart, frameStart + nObservations)
            frameStart += nObservations
            return { linearLocations: locationSlice, values: valueSlice }
        })
    }, [locations, values, frameBounds])

    return frames
}

export const getDecodedPositionFramePx = (linearFrame: DecodedPositionFrame | undefined, decodedLocationsMap: DecodedProbabilityLocationsMap): DecodedPositionFramePx | undefined => {
    if (linearFrame === undefined) return undefined
    const sortedGroup = linearFrame.values.map((v, i) => {return {value: v, linearLocation: linearFrame.linearLocations[i]}}).sort((a, b) => (b.value - a.value)) // desc sort
    const pixelLocations = sortedGroup.map(r => decodedLocationsMap[r.linearLocation])
    const values = sortedGroup.map(r => r.value)
    // const pixelLocations = linearFrame ? linearFrame.linearLocations.map((l) => decodedLocationsMap[l]) : []
    const finalFrame = linearFrame
        ? {
            locationRectsPx: pixelLocations,
            values: values
        }
        : undefined
    return finalFrame
}