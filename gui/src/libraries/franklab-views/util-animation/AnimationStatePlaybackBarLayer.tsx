import { BaseCanvas } from '../../core-views'
import React, { FunctionComponent, useCallback, useRef } from 'react'
import useDraggableScrubber from './AnimationControls/useDraggableScrubber'
import usePlaybackBarGeometry from './AnimationControls/usePlaybackBarGeometry'
import usePlaybackBarPixelState from './AnimationControls/usePlaybackBarPixelState'
import useDragSelection from './AnimationControls/usePlaybackBarSelection'
import useWheelHandler from './AnimationControls/useWheelHandler'
import { SelectedWindowUpdater, SelectionWindow } from './AnimationPlaybackControls'
import { AnimationStateDispatcher } from './AnimationStateReducer'

export type AnimationStatePlaybackBarLayerProps = {
    width: number
    height: number
    dispatch: AnimationStateDispatcher<any>
    visibleWindow: [number, number]
    windowProposal?: [number, number]
    selectedWindow: SelectionWindow
    updateSelectedWindow: SelectedWindowUpdater
    currentFrameIndex: number
    isPlaying: boolean
    leftOffset: number
    rightOffset?: number
    styling?: ScrubberStyle
}

export type ScrubberStyle = {
    leftMargin: number
    barHeight: number
    seenFillStyle: string
    unseenFillStyle: string
    selectedFillStyle: string
    scrubberFillStyle: string
    scrubberRadius: number
}

export const defaultStyling: ScrubberStyle = {
    leftMargin: 15,
    barHeight: 6,
    seenFillStyle: 'rgb(130, 130, 130)',
    unseenFillStyle: 'rgb(180, 14, 0)',
    selectedFillStyle: 'rgba(0, 0, 64, .4)',
    scrubberFillStyle: 'rgb(220, 220, 220)',
    scrubberRadius: 10
}

export type ProgressBarDrawData = {
    scrubberCenterX: number
    selectRange?: number[] // technically [number, number] but that requires a cast elsewhere. Refers to an ongoing drag-selected window range.
    proposedWindow?: number[]
}

// NOTE: "scrubberCenterX" assumes the bar starts at 0; the margin only shows up in the draw function.
const _draw = (context: CanvasRenderingContext2D, props: ProgressBarDrawData, barWidth: number, styling: ScrubberStyle) => {
    const { scrubberCenterX, selectRange, proposedWindow } = props
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    const unseen = barWidth - scrubberCenterX
    const verticalPadding = Math.floor((context.canvas.height - styling.barHeight)/2)
    context.fillStyle = styling.seenFillStyle
    context.fillRect(styling.leftMargin, verticalPadding, scrubberCenterX, styling.barHeight)
    context.fillStyle = styling.unseenFillStyle
    context.fillRect(scrubberCenterX + styling.leftMargin, verticalPadding, unseen, styling.barHeight)
    if (selectRange && selectRange.length === 2) {
        context.fillStyle = styling.selectedFillStyle
        const height = [0, context.canvas.height]
        context.fillRect(styling.leftMargin + selectRange[0], height[0], selectRange[1] - selectRange[0], height[1])
    }
    if (proposedWindow && proposedWindow.length === 2 && Math.abs(proposedWindow[0] - proposedWindow[1]) < barWidth) {
        context.fillStyle = styling.selectedFillStyle
        const height = [verticalPadding, styling.barHeight]
        context.fillRect(styling.leftMargin + proposedWindow[0], height[0], proposedWindow[1] - proposedWindow[0], height[1])
    }
    context.fillStyle = styling.scrubberFillStyle
    context.beginPath()
    context.arc(scrubberCenterX + styling.leftMargin, context.canvas.height / 2, styling.scrubberRadius, 0, 2*Math.PI)
    context.fill()
}

const dragSelectInitiationDelayMs = 150;

const _handleScrollbarClick = (x: number, y: number, pointToFrame: (x: number, y: number) => number | undefined, dispatch: AnimationStateDispatcher<any>) => {
    const newFrame = pointToFrame(x, y)
    if (!newFrame) return
    dispatch({type: 'SET_CURRENT_FRAME', newIndex: newFrame})
}


const AnimationStatePlaybackBarLayer: FunctionComponent<AnimationStatePlaybackBarLayerProps> = (props: AnimationStatePlaybackBarLayerProps) => {
    const { height, dispatch, isPlaying, leftOffset, selectedWindow, updateSelectedWindow } = props
    const { draw, getBarInterpreter, getEventPoint, barCanvasWidth, getBarClickToFrame, xToFrame, frameToPixelX } = usePlaybackBarGeometry({...props, baseDrawFn: _draw})
    const { scrubberCenterX, proposalXRange, barInterpreter, barClickToFrame } = usePlaybackBarPixelState({ ...props, getBarInterpreter, getBarClickToFrame, frameToPixelX })

    const { initiateScrubbing, terminateScrubbing, scrubbingStateHandler } = useDraggableScrubber(dispatch, barInterpreter)
    
    const handleScrollbarClick = useCallback((x: number, y: number) => _handleScrollbarClick(x, y, barClickToFrame, dispatch), [barClickToFrame, dispatch])

    const wheelHandler = useWheelHandler(dispatch)
    const handleWheel = useCallback((e: React.WheelEvent) => !isPlaying && wheelHandler(e), [isPlaying, wheelHandler])

    const dragSelectInitiationRef = useRef<number | undefined>(undefined)
    const { initiateDragSelection, terminateDragSelection, selectionUpdater } = useDragSelection(updateSelectedWindow, selectedWindow, dispatch, xToFrame)

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.buttons !== 1) return // we only care about left-clicks
        const [x, y] = getEventPoint(e)
        if (initiateScrubbing(x, y, isPlaying)) return // if the user grabbed the scrubber, don't do anything else
        dragSelectInitiationRef.current = window.setTimeout(() => {
            dragSelectInitiationRef.current = undefined
            initiateDragSelection(x)
        }, dragSelectInitiationDelayMs)
    }, [getEventPoint, isPlaying, initiateScrubbing, initiateDragSelection])
    
    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (dragSelectInitiationRef.current !== undefined) {
            // mouseup within dragSelectInitiationDelayMs after mousedown === timedout callback hasn't yet fired.
            // This corresponds to an actual click, not a drag initiation, so do the click handling stuff
            clearTimeout(dragSelectInitiationRef.current)
            dragSelectInitiationRef.current = undefined
            const [x, y] = getEventPoint(e)
            handleScrollbarClick(x, y)
            updateSelectedWindow(undefined) // TODO: Check for possible race condition or double-rerender?
            return
        }
        terminateScrubbing(isPlaying)
        terminateDragSelection()
    }, [getEventPoint, terminateScrubbing, terminateDragSelection, handleScrollbarClick, updateSelectedWindow, isPlaying])
    
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (e.buttons === 0) { // terminate drags where mouseup happened outside our element
            terminateScrubbing(isPlaying)
            terminateDragSelection()
            return // short-circuit processing of no-button mouse moves--we don't care about them
        }
        const [x] = getEventPoint(e)
        scrubbingStateHandler({ draggingPixelX: x, lookupFrameFn: xToFrame })
        selectionUpdater({ currentX: x})
    }, [terminateScrubbing, terminateDragSelection, isPlaying, getEventPoint, scrubbingStateHandler, xToFrame, selectionUpdater])
    
    const drawData = { 
        scrubberCenterX,
        selectRange: selectedWindow,
        proposedWindow: proposalXRange
    }

    return (
        <div onMouseUp={handleMouseUp}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onWheel={handleWheel}
        >
            <BaseCanvas<ProgressBarDrawData>
                width={barCanvasWidth}
                height={height}
                hOffsetPx={leftOffset}
                draw={draw}
                drawData={drawData}
            />
        </div>
    )
}

export default AnimationStatePlaybackBarLayer
