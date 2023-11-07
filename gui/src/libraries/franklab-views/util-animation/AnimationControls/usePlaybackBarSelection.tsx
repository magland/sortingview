import React, { useCallback, useMemo, useRef } from 'react'
import { DebounceThrottleResolver, DebounceThrottleUpdater, useThrottler } from '../../util-rate-limiters'
import { SelectedWindowUpdater, SelectionWindow } from '../AnimationPlaybackControls'
import { AnimationStateDispatcher } from '../AnimationStateReducer'

type PlaybackSelectionProps = {
    currentX: number
}

type PlaybackSelectionRefs = {
    dragStartXRef: React.MutableRefObject<number | undefined>
    currentXRef: React.MutableRefObject<number | undefined>
}

type PlaybackSelectionResolverProps = {
    updateSelectedWindow: SelectedWindowUpdater
}

const handleSelectionInitiation = (x: number, refs: PlaybackSelectionRefs) => {
    const { dragStartXRef, currentXRef } = refs
    if (dragStartXRef.current !== undefined) return // already dragging. Shouldn't happen. Might be interesting to log if it does.
    dragStartXRef.current = x
    currentXRef.current = x
}

const handleSelectionTermination = (refs: PlaybackSelectionRefs, selectedWindow: SelectionWindow, dispatch: AnimationStateDispatcher<any>, xToFrame: (x: number) => number) => {
    const { dragStartXRef, currentXRef } = refs
    if (dragStartXRef.current === undefined) return // don't take any action if there's no active drag happening
    dragStartXRef.current = undefined
    currentXRef.current = undefined

    if (selectedWindow === undefined) {
        dispatch({ type: 'PROPOSE_WINDOW', bounds: undefined })
    }

    const lowerFrame = xToFrame(Math.min(...(selectedWindow ?? [])))
    const higherFrame = xToFrame(Math.max(...(selectedWindow ?? [])))
    dispatch({ type: 'PROPOSE_WINDOW', bounds: [lowerFrame, higherFrame] })
}

const dragSelectionUpdater: DebounceThrottleUpdater<PlaybackSelectionProps, PlaybackSelectionRefs> = (refs, state) => {
    const { dragStartXRef, currentXRef } = refs
    const { currentX } = state
    if (!dragStartXRef.current) return false // not actually dragging
    if (currentXRef.current !== currentX) {
        currentXRef.current = currentX
        return true
    }
    return false
}

const dragSelectionResolver: DebounceThrottleResolver<PlaybackSelectionRefs, PlaybackSelectionResolverProps> = (refs, props) => {
    const { updateSelectedWindow } = props
    const { dragStartXRef, currentXRef } = refs
    // This handles an edge case where a mouse move triggers an update while selection finalization is already in progress
    if (dragStartXRef.current === undefined || currentXRef.current === undefined) return

    updateSelectedWindow([dragStartXRef.current, currentXRef.current])
}

const useSelectionRefs = () => {
    const dragStartXRef = useRef<number | undefined>(undefined)
    const currentXRef = useRef<number | undefined>(undefined)
    const refs = useMemo(() => {return { dragStartXRef, currentXRef }}, [dragStartXRef, currentXRef])
    return refs
}

const useThrottledDragSelection = (refs: PlaybackSelectionRefs, updateSelectedWindow: SelectedWindowUpdater) => {
    const resolverProps = useMemo(() => { return { updateSelectedWindow }}, [updateSelectedWindow])
    const { throttler: updateHandler } = useThrottler(dragSelectionUpdater, dragSelectionResolver, refs, resolverProps)
    return updateHandler
}

const useDragSelection = (updateSelectedWindow: SelectedWindowUpdater, selectedWindow: SelectionWindow,  dispatch: AnimationStateDispatcher<any>, xToFrame: (x: number) => number) => {
    const refs = useSelectionRefs()
    const throttledStateSetter = useThrottledDragSelection(refs, updateSelectedWindow)

    const initiateDragSelection = useCallback((x: number) => handleSelectionInitiation(x, refs), [refs])
    const terminateDragSelection = useCallback(() => handleSelectionTermination(refs, selectedWindow, dispatch, xToFrame),  [refs, selectedWindow, dispatch, xToFrame])

    return { initiateDragSelection, terminateDragSelection, selectionUpdater: throttledStateSetter }
}

export default useDragSelection