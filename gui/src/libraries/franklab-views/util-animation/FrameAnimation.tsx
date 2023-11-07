import React, { FunctionComponent, PropsWithChildren, useCallback, useEffect, useMemo } from "react"
import { PlaybackOptionalButtons } from '../util-animation'
import { AnimationPlaybackControls } from '../util-animation'
import { AnimationState, AnimationStateAction, curryDispatch } from '../util-animation'
import usePlaybackControlButtonLogic from "./AnimationControls/PlaybackControlButtonLogic"

export type FrameAnimationProps<T> = {
    width: number
    height: number
    controlsHeight: number
    state: AnimationState<T>
    dispatch: React.Dispatch<AnimationStateAction<T>>
    dataSeriesFrameRateHz?: number
    options?: AnimationOptionalFeatures
}

export type AnimationOptionalFeatures = {
    optionalButtons: PlaybackOptionalButtons[]
    doBookmarkCallback?: (state: AnimationState<any>) => void
    checkBookmarkedCallback?: (state: AnimationState<any>) => boolean
}

const setupAnimationStateDispatchFn = (animationStateDispatch: React.Dispatch<AnimationStateAction<any>>) => {
    if (!animationStateDispatch) return
    const aniDispatch = curryDispatch(animationStateDispatch)
    animationStateDispatch({
        type: 'SET_DISPATCH',
        animationDispatchFn: aniDispatch
    })
}


const setupReplayRate = (realTimeReplayRateMs: number | undefined, animationStateDispatch: React.Dispatch<AnimationStateAction<any>>) => {
    if (realTimeReplayRateMs && realTimeReplayRateMs !== 0) {
        animationStateDispatch({
            type: 'SET_BASE_MS_PER_FRAME',
            baseMsPerFrame: realTimeReplayRateMs
        })
    }
}


const _handleBookmark = (callback?: (state: AnimationState<any>) => void) => {
    const fn = callback === undefined ? () => {} : callback
    return fn
}


const _checkBookmark = (callback?: (state: AnimationState<any>) => boolean) => {
    const fn = callback === undefined ? () => false : callback
    return fn
}

const FrameAnimation: FunctionComponent<PropsWithChildren<FrameAnimationProps<any>>> = <T, >(props: PropsWithChildren<FrameAnimationProps<T>>) => {
    const { width, height, controlsHeight, state, dispatch, dataSeriesFrameRateHz, children, options } = props
    const { optionalButtons, doBookmarkCallback, checkBookmarkedCallback } = (options ?? {})

    useEffect(() => {
        const msPerFrame = dataSeriesFrameRateHz !== undefined ? 1000 / dataSeriesFrameRateHz : undefined
        setupReplayRate(msPerFrame, dispatch)
    }, [dataSeriesFrameRateHz, dispatch])
    useEffect(() => setupAnimationStateDispatchFn(dispatch), [dispatch])
    const drawHeight = useMemo(() => height - controlsHeight, [height, controlsHeight])

    const handleBookmark = useCallback(() => _handleBookmark(doBookmarkCallback)(state), [doBookmarkCallback, state])
    const stateIsBookmarked = useMemo(() => _checkBookmark(checkBookmarkedCallback)(state), [checkBookmarkedCallback, state])

    const uiFeatures = useMemo(() => {
        const currentWindowIsFullRecording = (state?.window[0] === 0 && state?.window[1] === (state?.frameData?.length - 1))
        const proposalExists = (state?.windowProposal && state?.windowProposal?.length === 2)
        const proposalMatchesWindow = (state?.windowProposal && state?.windowProposal[0] === state?.window[0] && state?.windowProposal[1] === state?.window[1])
        return {
            optionalButtons: optionalButtons ?? [],
            isSynced: state?.windowSynced,
            isCropped: state?.windowSynced || !currentWindowIsFullRecording,
            couldCrop: (!state?.windowSynced && proposalExists && !proposalMatchesWindow) || false,
            stateIsBookmarked: stateIsBookmarked,
            doBookmark: handleBookmark
        }
    }, [optionalButtons, state.windowSynced, state.window, state.windowProposal, state.frameData, stateIsBookmarked, handleBookmark])

    const controlButtonLogic = usePlaybackControlButtonLogic(dispatch)
    const animationControlProps = useMemo(() => {
        return {
            width,
            height: controlsHeight,
            verticalOffset: drawHeight,
            dispatch,
            totalFrameCount: state.frameData.length,
            visibleWindow: state.window,
            windowProposal: state.windowProposal,
            currentFrameIndex: state.currentFrameIndex,
            isPlaying: state.isPlaying,
            playbackRate: state.replayMultiplier,
            logic: controlButtonLogic,
            ui: uiFeatures
        }
    }, [width, controlsHeight, drawHeight, dispatch, state.frameData.length, state.window,
        state.windowProposal, state.currentFrameIndex, state.isPlaying, controlButtonLogic,
        uiFeatures, state.replayMultiplier])

    const controlLayer = useMemo(() => <AnimationPlaybackControls {...animationControlProps} />, [animationControlProps])
    const handleKey = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        controlButtonLogic.keyboardControlHandler(e)
        // eslint-disable-next-line
    }, [controlButtonLogic.keyboardControlHandler])
    
    return (
        <div onKeyDown={handleKey} tabIndex={0}>
            {children}
            {controlLayer}
        </div>
    )
}

export default FrameAnimation
