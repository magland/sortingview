import { validateObject } from "../../core-utils";
import { isArrayOf, isEqualTo, isNumber, isString, optional } from "../../core-utils";

export type PositionFrame = {
    x: number
    y: number
    headDirection?: number
    timestamp?: number
    decodedPositionFrame?: DecodedPositionFrame
}

export type DecodedPositionFrame = {
    linearLocations: number[]
    values: number[]
}

export type DecodedPositionFramePx = {
    locationRectsPx: number[][]
    values: number[]
}

// TODO: These two types may be combined as the streaming/live view is implemented.

/**
 * Data comprising a complete (non-streamed) track animation. The track itself is
 * represented as a set of rectangles (a sparse subset of the full grid), and there are separate lists of timestamps
 * and corresponding positions, as well as the track extrema and the
 * optional sampling rate (number of frames per second in the recording - controls the base replay rate).
 * 
 * @member trackBinWidth The width of a single tile in the track, in native units. NOT
 * the width of the overall track.
 * @member trackBinHeight The height of a single tile in the track, in native units. NOT
 * the height of the overall track.
 * @member trackBinULCorners The upper-left corner of each tile in the constituent track,
 * represented as an array of x-coordinates and an array of y-coordinates (i.e. number[2][:]).
 * These are in the native units of the source data.
 * @member timestampStart If set, this is the offset of the timestamp array, with the timestamps
 * array representing elapsed time since the start of the recording. (This fixes resolution issues
 * related to representing timestamps as floats rather than doubles.)
 * @member timestamps Array of (float) timestamps which should align with the position list.
 * The animal should be observed at position (positions[0][t], positions[1][t]) at time
 * timestamps[t].
 * @member positions Animal position at the aligned timestamp from timestamps, in native units.
 * Represented as an array of x-coordinates and an array of y-coordinates.
 * @member xmin Lowest x-value to display, in native units.
 * @member xmax Highest x-value to display, in native units.
 * @member ymin Lowest y-value to display, in native units.
 * @member ymax Highest y-value to display, in native units.
 * @member headDirection Direction of the animal's head in the xy-plane, in radians.
 * @member decodedData The compressed sparse representation of decoded position data, as a DecodedPositionData object.
 * @member samplingFrequencyHz Optional (Default 60), Sampling frequency of the recording - should coincide with 1/Delta_t where Delta_t is the mode of the timestamp deltas
 */
export type TrackAnimationStaticData = {
    type: 'TrackAnimation'
    trackBinWidth: number
    trackBinHeight: number
    trackBinULCorners: [number[], number[]]
    totalRecordingFrameLength: number
    timestampStart?: number
    timestamps: number[]
    positions: [number[], number[]]
    xmin: number
    xmax: number
    ymin: number
    ymax: number
    headDirection?: number[]
    decodedData?: DecodedPositionData
    samplingFrequencyHz?: number
}

export const isTrackAnimationStaticData = (x: any): x is TrackAnimationStaticData => {
    const typeMatch = validateObject(x, {
        type: isEqualTo('TrackAnimation'),
        trackBinWidth: isNumber,
        trackBinHeight: isNumber,
        trackBinULCorners: isArrayOf(isArrayOf(isNumber)),
        totalRecordingFrameLength: isNumber,
        timestampStart: optional(isNumber),
        timestamps: isArrayOf(isNumber),
        positions: isArrayOf(isArrayOf(isNumber)), // alternative: assume inner is correct
        xmin: isNumber,
        xmax: isNumber,
        ymin: isNumber,
        ymax: isNumber,
        decodedData: optional(isDecodedPositionData),
        headDirection: optional(isArrayOf(isNumber)),
        samplingFrequencyHz: optional(isNumber)
    })
    if (typeMatch) {
        const candidate = x as TrackAnimationStaticData
        const rangeFail = candidate.xmin >= candidate.xmax || candidate.ymin >= candidate.ymax
        const trackRectsDimensionsFail = candidate.trackBinULCorners.length !== 2 || candidate.trackBinULCorners[0].length !== candidate.trackBinULCorners[1].length
        const positionDimensionsFail = candidate.positions.length !== 2
        const timesCount = candidate.timestamps.length
        const timestampPositionMismatch = timesCount !== candidate.positions[0].length || timesCount !== candidate.positions[1].length
        const headDirectionLengthMismatch = (candidate.headDirection && candidate.headDirection.length > 0 && timesCount !== candidate.headDirection.length)
        const decodedProbabilityFrameBoundsMatchesOverallFrameLength = (!x.decodedProbabilityFrameBounds) || (x.decodedProbabilityFrameBounds.length === x.totalRecordingFrameLength)
        const decodedDataFrameCountMatchesPositionData = !(candidate.decodedData) || !(candidate.decodedData.frameBounds) || candidate.decodedData.frameBounds.length === timesCount

        return !(rangeFail || trackRectsDimensionsFail || positionDimensionsFail || timestampPositionMismatch || headDirectionLengthMismatch
                    || !decodedProbabilityFrameBoundsMatchesOverallFrameLength || !decodedDataFrameCountMatchesPositionData)
    }

    return false
}

/**
 * @member xmin The minimum x-coordinate of the used bin centers, native units.
 * @member binWidth Width of each bin, native units.
 * @member xcount Number of bins accross to achieve the full extent
 * @member ymin The minimum y-coordinate of the used bin centers, native units.
 * @member binHeight Height of each bin, native units.
 * @member ycount Number of bins down to achieve the full extent
 * @member uniqueLocations Optional, To save browser-side computation, a list of all unique values in the locations array
 * @member values Decoded scaled probability values 0-255 (corresponding to locations)
 * @member locations Linearized integer positions of the sparse data. p0 = x0 + xcount * y0 --> center: [xmin + x0 * binWidth, ymin + y0 * binHeight]
 * @member frameBounds: Array of entry counts, one for each time frame. Serves as an index for values/locations.
 * The observations corresponding to timestamps[t] are values[sum(frameBounds[:t]):sum(frameBounds[:t]) + frameBounds[t]]
 */
export type DecodedPositionData = {
    type: 'DecodedPositionData'
    xmin: number
    binWidth: number
    xcount: number
    ymin: number
    binHeight: number
    ycount: number
    uniqueLocations?: number[]
    values: number[]
    locations: number[]
    frameBounds: number[]
}

export const isDecodedPositionData = (x: any): x is DecodedPositionData => {
    const typeMatch = validateObject(x, {
        type: isEqualTo('DecodedPositionData'),
        xmin: isNumber,
        binWidth: isNumber,
        xcount: isNumber,
        ymin: isNumber,
        binHeight: isNumber,
        ycount: isNumber,
        uniqueLocations: optional(isArrayOf(isNumber)),
        values: optional(isArrayOf(isNumber)),
        locations: optional(isArrayOf(isNumber)),
        frameBounds: optional(isArrayOf(isNumber))
    })
    if (!x.values && !x.locations && !x.frameBounds) return true // an empty object is a valid one for right now
    if (typeMatch) {
        // data integrity checks
        const candidate = x as DecodedPositionData
        if (!candidate.values || !candidate.locations || !candidate.frameBounds) return false // if any list is defined, all must be defined
        const valuesLocationsLengthsMatch = candidate.values.length === candidate.locations.length
        const frameBoundsAccountForAllValues = candidate.values.length === candidate.frameBounds.reduce((sum, item) => sum + item, 0)
        if (!frameBoundsAccountForAllValues) {
            console.warn(`IGNORING FOR NOW: Frame bounds do not account for all values. ${candidate.values.length} <> ${candidate.frameBounds.reduce((sum, item) => sum + item, 0)}`)
        }
        // return valuesLocationsLengthsMatch && frameBoundsAccountForAllValues
        return valuesLocationsLengthsMatch
    }

    return false
}


export type TrackAnimationLiveData = {
    type: 'TrackAnimationLive'
    trackBinWidth: number
    trackBinHeight: number
    trackBinULCorners: number[][]
    totalRecordingFrameLength: number
    dataUri: string
    initialReplayRate?: number
}

export const isTrackAnimationLiveData = (x: any): x is TrackAnimationLiveData => {
    return validateObject(x, {
        type: isEqualTo('TrackAnimationLive'),
        trackBinWidth: isNumber,
        trackBinHeight: isNumber,
        trackBinULCorners: isArrayOf(isArrayOf(isNumber)),
        totalRecordingFrameLength: isNumber,
        dataUri: isString,
        initialReplayRate: optional(isNumber)
    })
}
