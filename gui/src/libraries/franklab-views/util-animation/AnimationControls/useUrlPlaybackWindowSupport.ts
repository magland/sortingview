import { useUrlState } from '@figurl/interface'
import React, { useCallback } from 'react'
import { AnimationState, AnimationStateAction } from '../../util-animation'

const useUrlPlaybackWindowSupport = (dispatch: React.Dispatch<AnimationStateAction<any>>) => {
    /**
     * Hook returns three callbacks.
     * 
     * setStateToInitialUrl sets the window and current frame from data in the initial URL, if populated.
     * This parameterless callback should be executed by consumer when the animation frame data updates.
     * 
     * handleSaveWindowToUrl is a callback that persists elements of the current playback state into
     * the URL. This callback is likely to be consumed by the PlaybackBookmarkButton.
     * 
     * compareStateToUrl takes the current animation state and compares it to the one represented
     * in the URL. It returns true if they match, else false.
     * 
     */
    const { initialUrlState, updateUrlState, urlState } = useUrlState()

    const setStateToInitialUrl = useCallback(() => {
        const { playbackWindowFrameStart, playbackWindowFrameEnd, playbackWindowFocusFrame } = initialUrlState
        if (playbackWindowFrameStart !== undefined && playbackWindowFrameEnd !== undefined) {
            const minFrame = Math.min(playbackWindowFrameStart, playbackWindowFrameEnd)
            const maxFrame = Math.max(playbackWindowFrameStart, playbackWindowFrameEnd)
            dispatch({
                type: 'SET_WINDOW',
                bounds: [minFrame, maxFrame]
            })
            dispatch({
                type: 'PROPOSE_WINDOW',
                bounds: [minFrame, maxFrame]
            })
        }
        if (playbackWindowFocusFrame) {
            dispatch({
                type: 'SET_CURRENT_FRAME',
                newIndex: playbackWindowFocusFrame
            })
        }
    }, [dispatch, initialUrlState])

    const handleSaveWindowToUrl = useCallback((state: AnimationState<any>) => {
        const startFrame = state.window[0] === 0 ? undefined : state.window[0]
        const endFrame = state.window[1] === state.frameData.length - 1 ? undefined : state.window[1]
        const focusFrame = state.currentFrameIndex === 0 ? undefined : state.currentFrameIndex

        const window = startFrame !== undefined && endFrame !== undefined
            ? {playbackWindowFrameStart: Math.min(startFrame, endFrame), playbackWindowFrameEnd: Math.max(startFrame, endFrame)}
            : {}
        const focus = focusFrame !== undefined ? { playbackWindowFocusFrame: focusFrame } : {}
        updateUrlState( {...window, ...focus} )
    }, [updateUrlState])

    const compareStateToUrl = useCallback((state: AnimationState<any>) => {
        const urlFrame: number | undefined = urlState.playbackWindowFocusFrame
        const urlWindowStart: number | undefined = urlState.playbackWindowFrameStart
        const urlWindowEnd: number | undefined = urlState.playbackWindowFrameEnd

        return (urlFrame !== undefined || urlWindowStart !== undefined || urlWindowEnd !== undefined)
            && (urlFrame === undefined || urlFrame === state.currentFrameIndex)
            && (urlWindowStart === undefined || urlWindowStart === state.window[0])
            && (urlWindowEnd === undefined || urlWindowEnd === state.window[1])
    }, [urlState])

    return ({setStateToInitialUrl, handleSaveWindowToUrl, compareStateToUrl})
}

export default useUrlPlaybackWindowSupport