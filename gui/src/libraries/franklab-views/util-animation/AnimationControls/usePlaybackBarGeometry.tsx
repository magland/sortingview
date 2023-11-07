import { norm } from 'mathjs'
import React, { useCallback, useMemo } from 'react'
import { defaultStyling, ProgressBarDrawData, ScrubberStyle } from '../AnimationStatePlaybackBarLayer'
import { AnimationStateDispatcher } from '../AnimationStateReducer'

export type AnimationStatePlaybackBarGeometryProps = {
    width: number
    height: number
    dispatch: AnimationStateDispatcher<any>
    visibleWindow: [number, number]
    currentFrameIndex: number
    isPlaying: boolean
    leftOffset: number
    rightOffset?: number
    styling?: ScrubberStyle
    baseDrawFn: (context: CanvasRenderingContext2D, props: ProgressBarDrawData, barWidth: number, styling: ScrubberStyle) => void
}


export type LogicalBarStatus = 'scrubber' | 'bar' | undefined
export type LogicalBarInterpreter = (x: number, y: number) => LogicalBarStatus
export type LogicalBarInterpreterGenerator = (scrubberCenterX: number) => LogicalBarInterpreter
const _barInterpreter = (x: number, y: number, scrubberCenterX: number, scrubberRadius: number, canvasVMidline: number): LogicalBarStatus => {
    const xOffset = x - scrubberCenterX
    const yOffset = canvasVMidline - y
    // case 1: click is on the scrubber
    return norm([xOffset, yOffset], 2) < scrubberRadius
        ? 'scrubber'
        // case 2: not on scrubber but within scrubber's height of bar
        : Math.abs(yOffset) < scrubberRadius
            ? 'bar'
            : undefined // case 3: not on bar or scrubber
}


const _xToFrame = (x: number, framesPerPixel: number, firstFrame: number, barWidth: number) => {
    const boundedPixelX = Math.min(Math.max(0, x), barWidth)
    return Math.floor(boundedPixelX * framesPerPixel) + firstFrame
}


const _frameToPixelX = (framesPastInitialFrame: number, framesPerPixel: number) => {
    return Math.floor(framesPastInitialFrame/framesPerPixel)
}


const _getEventPoint = (e: React.MouseEvent, totalLeftOffset: number) => {
    const boundingRect = e.currentTarget.getBoundingClientRect()
    const point = [e.clientX - boundingRect.x - totalLeftOffset, e.clientY - boundingRect.y]
    return point
}


const usePlaybackBarGeometry = (props: AnimationStatePlaybackBarGeometryProps) => {
    const { width, height, visibleWindow, leftOffset, rightOffset, styling, baseDrawFn } = props

    const _styling = useMemo(() => styling ? styling : defaultStyling, [styling])
    
    const barCanvasVCenter = useMemo(() => height / 2, [height])
    const barCanvasWidth = useMemo(() => width - leftOffset - (rightOffset ?? 0), [width, leftOffset, rightOffset])

    const barWidth = useMemo(() => barCanvasWidth - (_styling.leftMargin * 2), [barCanvasWidth, _styling.leftMargin])
    const framesPerPixel = useMemo(() => (visibleWindow[1] - visibleWindow[0])/barWidth, [visibleWindow, barWidth])

    const xToFrame = useCallback((x: number) => _xToFrame(x, framesPerPixel, visibleWindow[0], barWidth), [framesPerPixel, visibleWindow, barWidth])
    const getEventPoint = useCallback((e: React.MouseEvent) => _getEventPoint(e, (leftOffset + _styling.leftMargin)), [leftOffset, _styling.leftMargin])
    const frameToPixelX = useCallback((elapsedFrames: number) => _frameToPixelX(elapsedFrames, framesPerPixel), [framesPerPixel])

    const getBarInterpreter: LogicalBarInterpreterGenerator = useCallback(
        (scrubberCenterX) =>
            (x: number, y: number) => _barInterpreter(x, y, scrubberCenterX, _styling.scrubberRadius, barCanvasVCenter),
        [_styling.scrubberRadius, barCanvasVCenter])
    const getBarClickToFrame = useCallback((interpreter: LogicalBarInterpreter) => (x: number, y: number) => interpreter(x, y) ? xToFrame(x) : undefined, [xToFrame])
    const draw = useCallback((context: CanvasRenderingContext2D, props: ProgressBarDrawData) => baseDrawFn(context, props, barWidth, _styling), [barWidth, _styling, baseDrawFn])

    return { barWidth, draw, getBarInterpreter, getBarClickToFrame, getEventPoint, xToFrame, frameToPixelX, barCanvasWidth }
}



export default usePlaybackBarGeometry
