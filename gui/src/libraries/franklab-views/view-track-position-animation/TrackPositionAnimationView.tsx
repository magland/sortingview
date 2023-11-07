import { Margins, TwoDTransformProps, use2DTransformationMatrix, useAspectTrimming } from '../../core-views'
import { useTimeseriesSelection, useTimeseriesSelectionInitialization } from '../../timeseries-views'
import { matrix, Matrix, multiply, transpose } from 'mathjs'
import React, { FunctionComponent, useEffect, useMemo } from "react"
import { useStyleSettings } from '../context-style-settings/StyleSettingsContext'
import { AnimationOptionalFeatures, AnimationState, AnimationStateAction, AnimationStateReducer, BOOKMARK_BUTTON, CROP_BUTTON, FrameAnimation, makeDefaultState, PlaybackOptionalButtons, SYNC_BUTTON, useLiveTimeSyncing, useTimeWindowSyncing, useUrlPlaybackWindowSupport } from '../util-animation'
import { useColorStyles8Bit } from '../util-color-scales'
import ColorControl from '../util-color-scales/ColorControl'
import TPADecodedPositionLayer, { useConfiguredDecodedPositionDrawFunction } from './TPADecodedPositionLayer'
import { getDecodedPositionFramePx, useProbabilityFrames, useProbabilityLocationsMap } from './TPADecodedPositionLogic'
import TPAPositionLayer, { useConfiguredObservedPositionDrawFunction } from './TPAPositionLayer'
import TPATrackLayer from './TPATrackLayer'
import { DecodedPositionData, DecodedPositionFrame, PositionFrame, TrackAnimationStaticData } from "./TrackPositionAnimationTypes"

// TODO: Implement streaming / live view

export type TrackPositionAnimationProps = {
    data: TrackAnimationStaticData
    colorControlsSatisfied?: boolean
    width: number
    height: number
}

const controlsHeight = 40
const colorControlsHeight = 35

const defaultMargins: Margins = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 40
}

export const computeTrackBinPixelDimensions = (transform: Matrix, trackRectPoints: number[][], trackRectWidth: number, trackRectHeight: number) => {
    const flippedY = (transform.valueOf() as number[][])[1][1] < 0 ? true : false
    const sourcePoints = [trackRectPoints[0], trackRectPoints[1], new Array(trackRectPoints[0].length).fill(1)]
    const all = matrix([[trackRectWidth, ...sourcePoints[0]], [trackRectHeight, ...sourcePoints[1]], [0, ...sourcePoints[2]]])
    const converted = multiply(transform, all).valueOf() as any as number[][]
    const trackRectPixelWidth = converted[0].shift() as number
    const trackRectPixelHeight = (flippedY ? -1 : 1) * (converted[1].shift() as number)
    // Ensure that there are some actual columns in the resulting matrix: otherwise the transpose will fatally fail
    const perPointView = converted[0].length === 0 ? [] : transpose(converted)
    const rects = perPointView.map(pt => { return [...pt, trackRectPixelWidth, trackRectPixelHeight] })
    return rects
}

const useTrackBinPixelDimensions = (transform: Matrix, trackRectPoints: number[][], trackRectWidth: number, trackRectHeight: number) => {
    return useMemo(() => computeTrackBinPixelDimensions(transform, trackRectPoints, trackRectWidth, trackRectHeight), [transform, trackRectPoints, trackRectWidth, trackRectHeight])
}

const usePixelPositions = (transform: Matrix, points: number[][]) => {
    return useMemo(() => {
        if (points.length === 0) return undefined
        const augmentedNativePoints = matrix([
            points[0],
            points[1],
            new Array(points[0].length).fill(1)
        ])
        const pixelPoints = multiply(transform, augmentedNativePoints).valueOf() as number[][]
        return transpose(pixelPoints) // converts [[xs], [ys]] -> [[x0, y0], [x1, y1], ...]
    }, [transform, points])
}

const useFrames = (
    positions: number[][],
    decodedData: DecodedPositionData | undefined,
    transform: Matrix,
    headDirection: number[] | undefined,
    timestampStart: number | undefined,
    timestamps: number[]
    ) => {
    const positionSet = useMemo(() => {
        return positions
    }, [positions])
    const probabilityFrames = useProbabilityFrames(decodedData)
    const pixelPositions = usePixelPositions(transform, positionSet)
    const positionFrames = usePositionFrames(pixelPositions, timestampStart, timestamps, headDirection, probabilityFrames)

    return positionFrames
}

const usePositionFrames = (positions: number[][] | undefined, timestampStart: number | undefined, timestamps: number[], headDirection: number[] | undefined, decodedData: DecodedPositionFrame[] | undefined): PositionFrame[] => {
    return useMemo(() => {
        if (positions === undefined) return []
        return positions.map((p, i) => {
            return {
                x: p[0],
                y: p[1],
                timestamp: timestamps[i] + (timestampStart || 0),
                headDirection: headDirection && headDirection[i],
                decodedPositionFrame: decodedData && decodedData[i]
            }
        })
    }, [positions, timestampStart, timestamps, headDirection, decodedData])
}

const useDrawingSpace = (width: number, drawHeight: number, xmax: number, xmin: number, ymax: number, ymin: number) => {
    // We call the final-margin computation manually because we need to track margins for timestamp display
    const finalMargins = useAspectTrimming({
        pixelWidth: width,
        pixelHeight: drawHeight,
        xrange: xmax - xmin,
        yrange: ymax - ymin,
        margins: defaultMargins
    })

    const matrixProps: TwoDTransformProps = useMemo(() => {
        return {
            pixelWidth: width,
            pixelHeight: drawHeight,
            margins: finalMargins,
            xmin, xmax, ymin, ymax,
            invertY: true,
            preserveDataAspect: false // don't recompute the final margins--we already did it manually
        }
    }, [width, drawHeight, xmin, xmax, ymin, ymax, finalMargins])
    const transform = use2DTransformationMatrix(matrixProps)

    return { finalMargins, transform }
}


type TPAReducer = React.Reducer<AnimationState<PositionFrame>, AnimationStateAction<PositionFrame>>
const initialState = makeDefaultState<PositionFrame>()
const getTimeFromFrame = (frame: PositionFrame | undefined) => frame?.timestamp ?? -1

const TrackPositionAnimationView: FunctionComponent<TrackPositionAnimationProps> = (props: TrackPositionAnimationProps) => {
    const { data, width, height, colorControlsSatisfied } = props
    const { xmin, xmax, ymin, ymax, headDirection, samplingFrequencyHz } = data

    const [animationState, animationStateDispatch] = React.useReducer<TPAReducer>(AnimationStateReducer, initialState)
    const canvasHeight = height - (colorControlsSatisfied ? 0 : colorControlsHeight)
    const drawHeight = canvasHeight - controlsHeight
    const { finalMargins, transform } = useDrawingSpace(width, drawHeight, xmax, xmin, ymax, ymin)
    const trackBins = useTrackBinPixelDimensions(transform, data.trackBinULCorners, data.trackBinWidth, data.trackBinHeight)

    // TODO: Implement support for appending to position data (for a live/streaming context)
    const decodedData: DecodedPositionData | undefined = useMemo(() => {
        return data.decodedData 
    }, [data.decodedData])
    const dataFrames = useFrames(data.positions, decodedData, transform, headDirection, data.timestampStart, data.timestamps)
    const decodedLocationsMap = useProbabilityLocationsMap(transform, decodedData)

    useTimeseriesSelectionInitialization(data.timestamps[0] + (data.timestampStart ?? 0), data.timestamps[data.timestamps.length - 1] + (data.timestampStart ?? 0))
    
    const { colorStyles, primaryContrastColor, secondaryContrastColor } = useColorStyles8Bit()

    useEffect(() => {
        animationStateDispatch({
            type: 'UPDATE_FRAME_DATA',
            incomingFrames: dataFrames,
            replaceExistingFrames: true
        })
    }, [dataFrames])

    const { currentTime, setCurrentTime } = useTimeseriesSelection()  // state imported from recording context

    const { handleOutsideTimeUpdate, handleFrameTimeUpdate } = useLiveTimeSyncing(setCurrentTime, animationState, animationStateDispatch, getTimeFromFrame)
    useEffect(() => handleOutsideTimeUpdate(currentTime), [handleOutsideTimeUpdate, currentTime])
    useEffect(() => handleFrameTimeUpdate(), [handleFrameTimeUpdate])

    useTimeWindowSyncing(animationState, animationStateDispatch, getTimeFromFrame)

    const {setStateToInitialUrl, handleSaveWindowToUrl, compareStateToUrl} = useUrlPlaybackWindowSupport(animationStateDispatch)
    useEffect(() => setStateToInitialUrl(), [setStateToInitialUrl, dataFrames]) // triggers on (unchanging) callback or when the data is updated
    const optionalPlaybackControls: AnimationOptionalFeatures = {
        optionalButtons: [ SYNC_BUTTON, CROP_BUTTON, BOOKMARK_BUTTON ] as PlaybackOptionalButtons[],
        doBookmarkCallback: handleSaveWindowToUrl,
        checkBookmarkedCallback: compareStateToUrl
    }
    

    const currentProbabilityFrame = useMemo(() => {
        const linearFrame = animationState.frameData[animationState.currentFrameIndex]?.decodedPositionFrame
        const finalFrame = getDecodedPositionFramePx(linearFrame, decodedLocationsMap)
        // The position frames are now sorted in descending order of value, so the first entry is always a valid max value.
        const peakBinRect = finalFrame?.locationRectsPx[0] ?? undefined
        const peakCenter = peakBinRect === undefined ? undefined : [peakBinRect[0] + (peakBinRect[2]/2), peakBinRect[1] + (peakBinRect[3]/2)]
        return {
            frame: finalFrame,
            peakCenterPx: peakCenter
        }
    }, [animationState.currentFrameIndex, animationState.frameData, decodedLocationsMap])

    const currentPositionFrame = useMemo(() => {
        return {
            bottomMargin: finalMargins.bottom,
            frame: animationState.frameData[animationState.currentFrameIndex]
        }
    }, [animationState.currentFrameIndex, animationState.frameData, finalMargins.bottom])
    
    // set dot radius to be the floor of half a bin diagonal
    const positionDotRadius = useMemo(() => {
        return Math.max(Math.floor(Math.sqrt((Math.pow(trackBins[0][2], 2)) + Math.pow(trackBins[0][3], 2))/2), 1)
    }, [trackBins])
    
    const trackLayer = useMemo(() => <TPATrackLayer
            width={width}
            height={drawHeight}
            trackBucketRectanglesPx={trackBins}
            trackColor={colorStyles[0]}
        />, [width, drawHeight, trackBins, colorStyles])
    
    const peakStyling = useMemo(() => { return { dotRadius: positionDotRadius, drawPeakDot: true, dotRgb: secondaryContrastColor }}, [positionDotRadius, secondaryContrastColor])
    const configuredDecodedPositionDrawFn = useConfiguredDecodedPositionDrawFunction(colorStyles, peakStyling)
    const probabilityLayer = useMemo(() => <TPADecodedPositionLayer
            width={width}
            height={drawHeight}
            drawData={currentProbabilityFrame}
            configuredDrawFnCallback={configuredDecodedPositionDrawFn}
        />, [width, drawHeight, currentProbabilityFrame, configuredDecodedPositionDrawFn])
    
    const observedPositionStyling = useMemo(() => { return { dotColor: primaryContrastColor, dotRadius: positionDotRadius }}, [primaryContrastColor, positionDotRadius])
    const configuredObservedDrawFn = useConfiguredObservedPositionDrawFunction(observedPositionStyling)
    const positionLayer = useMemo(() => <TPAPositionLayer
            width={width}
            height={drawHeight}
            drawData={currentPositionFrame}
            configuredDrawFnCallback={configuredObservedDrawFn}
        />, [width, drawHeight, currentPositionFrame, configuredObservedDrawFn])

    const { styleSettings, styleSettingsDispatch } = useStyleSettings()
    const controlSection = ColorControl({dispatch: styleSettingsDispatch, colorMap: styleSettings.colorMap, rangeMax: styleSettings.colorMapRangeMax })

    return (
        <div style={{height: height}}>
            <FrameAnimation
                width={width}
                height={canvasHeight}
                controlsHeight={controlsHeight}
                state={animationState}
                dispatch={animationStateDispatch}
                dataSeriesFrameRateHz={samplingFrequencyHz}
                options={optionalPlaybackControls}
            >
                {trackLayer}
                {probabilityLayer}
                {positionLayer}
            </FrameAnimation>
            {!colorControlsSatisfied && <div style={{height: colorControlsHeight, position: 'absolute', top: height - colorControlsHeight}}> {controlSection} </div>}
        </div>
    )
}

export default TrackPositionAnimationView
