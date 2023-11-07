import React, { useCallback, useMemo, useRef } from 'react'
import { DebounceThrottleResolver, DebounceThrottleUpdater, useThrottler } from '../../util-rate-limiters'
import { AnimationStateDispatcher } from '../AnimationStateReducer'
import { LogicalBarInterpreter } from './usePlaybackBarGeometry'

type ScrubberDragProperties = {
    draggingPixelX: number
    lookupFrameFn: (x: number) => number | undefined
}

type ScrubberDragRefs = {
    dragPointRef: React.MutableRefObject<number | undefined>
    currentFrameIndexRef: React.MutableRefObject<number>
    targetFrameIndexRef: React.MutableRefObject<number | undefined>
}

type ScrubberDragResolverProps = {
    dispatch: AnimationStateDispatcher<any>
}

type InitiateTerminateScrubbingProps = {
    x: number
    y: number
    isPlaying: boolean,
    barInterpreter: LogicalBarInterpreter
    dragPointRef: React.MutableRefObject<number | undefined>
    wasPlayingRef: React.MutableRefObject<boolean>
    dispatch: AnimationStateDispatcher<any>
}
/**
 * Returns true if we initiated scrubbing, false if not.
 */
const conditionallyHandleScrubbingInitiation = (props: InitiateTerminateScrubbingProps) => {
    const { x, y, barInterpreter, dragPointRef, isPlaying, wasPlayingRef, dispatch } = props
    const clickStatus = barInterpreter(x, y)
    if (clickStatus !== 'scrubber') return false
    dragPointRef.current = x
    wasPlayingRef.current = isPlaying
    if (isPlaying) dispatch({type: 'TOGGLE_PLAYBACK'})
    return true
}


const conditionallyHandleScrubbingTermination = (isPlaying: boolean, dragPointRef: React.MutableRefObject<number | undefined>, wasPlayingRef: React.MutableRefObject<boolean>, dispatch: AnimationStateDispatcher<any>) => {
    if (dragPointRef.current && wasPlayingRef.current && !isPlaying) {
        dispatch({type: 'TOGGLE_PLAYBACK'})
    }
    wasPlayingRef.current = false
    dragPointRef.current = undefined
}


const scrubberMoveUpdate: DebounceThrottleUpdater<ScrubberDragProperties, ScrubberDragRefs> = (refs, state) => {
    const { dragPointRef, targetFrameIndexRef } = refs
    const { draggingPixelX, lookupFrameFn } = state
    if (!dragPointRef.current) return false
    if (Math.abs(draggingPixelX - dragPointRef.current) < 2) return false

    dragPointRef.current = draggingPixelX
    const frame = lookupFrameFn(draggingPixelX)
    if (frame === targetFrameIndexRef.current) return false

    targetFrameIndexRef.current = frame
    return true
}


const scrubberMoveResolver: DebounceThrottleResolver<ScrubberDragRefs, ScrubberDragResolverProps> = (refs, props) => {
    const { dispatch } = props
    const { dragPointRef, currentFrameIndexRef, targetFrameIndexRef } = refs
    if (dragPointRef.current && targetFrameIndexRef.current && targetFrameIndexRef.current !== currentFrameIndexRef.current) {
        dispatch({type: 'SET_CURRENT_FRAME', newIndex: targetFrameIndexRef.current})
    }
    targetFrameIndexRef.current = undefined
}


const useScrubberRefs = () => {
    const dragPointRef = useRef<number | undefined>(undefined)
    const currentFrameIndexRef = useRef<number>(0)
    const targetFrameIndexRef = useRef<number | undefined>(undefined)
    const refs = useMemo(() => {return { dragPointRef, currentFrameIndexRef, targetFrameIndexRef }}, [dragPointRef, currentFrameIndexRef, targetFrameIndexRef])
    return refs
}


const useScrubberMoveUpdater = (dispatch: AnimationStateDispatcher<any>, refs: ScrubberDragRefs) => {
    const resolverProps = useMemo(() => { return { dispatch }}, [dispatch])
    const updateHandler = useThrottler(scrubberMoveUpdate, scrubberMoveResolver, refs, resolverProps)
    return updateHandler
}


const useDraggableScrubber = (dispatch: AnimationStateDispatcher<any>, barInterpreter: LogicalBarInterpreter) => {
    const refs = useScrubberRefs()
    const wasPlayingRef = useRef<boolean>(false)
    const { throttler } = useScrubberMoveUpdater(dispatch, refs)

    const initiateScrubbing = useCallback((x: number, y: number, isPlaying: boolean) => {
        const props = {
            barInterpreter,
            isPlaying,
            dragPointRef: refs.dragPointRef,
            wasPlayingRef: wasPlayingRef,
            dispatch
        }
        return conditionallyHandleScrubbingInitiation({ x, y, ...props })
    }, [barInterpreter, refs.dragPointRef, wasPlayingRef, dispatch])

    const terminateScrubbing = useCallback((isPlaying: boolean) => {
        conditionallyHandleScrubbingTermination(isPlaying, refs.dragPointRef, wasPlayingRef, dispatch)
    }, [refs.dragPointRef, wasPlayingRef, dispatch])
    
    return { initiateScrubbing, terminateScrubbing, scrubbingStateHandler: throttler }
}


export default useDraggableScrubber