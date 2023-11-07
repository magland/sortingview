import React, { useCallback, useMemo } from "react"
import { AnimationStateDispatcher } from "../AnimationStateReducer"

export type PlaybackButtonLogicCallback = (e: React.MouseEvent<any> | React.KeyboardEvent<HTMLDivElement>) => void
export type KeyHandler = (e: React.KeyboardEvent<HTMLDivElement>) => void

export type PlaybackControlLogic = {
    returnToBeginningHandler: PlaybackButtonLogicCallback
    backSkipHandler: PlaybackButtonLogicCallback
    forwardSkipHandler: PlaybackButtonLogicCallback
    jumpToEndHandler: PlaybackButtonLogicCallback
    playPauseHandler: PlaybackButtonLogicCallback
    reverseDirectionHandler: PlaybackButtonLogicCallback
    syncWindowHandler: PlaybackButtonLogicCallback
    cropWindowHandler: PlaybackButtonLogicCallback
    keyboardControlHandler: KeyHandler
}

const usePlaybackControlButtonLogic = (dispatch: AnimationStateDispatcher<any>): PlaybackControlLogic => {
    const handleSkipArrow = useCallback((mode: 'end' | 'skip', backward?: boolean) => {
        return (e: React.MouseEvent | React.KeyboardEvent) => {
            dispatch({
                type: mode === 'end' ? 'TO_END' : 'SKIP',
                backward: backward
            })
        }
    }, [dispatch])

    const returnToBeginningHandler = useMemo(() => handleSkipArrow('end', true), [handleSkipArrow])
    const backSkipHandler = useMemo(() => handleSkipArrow('skip', true), [handleSkipArrow])
    const forwardSkipHandler = useMemo(() => handleSkipArrow('skip'), [handleSkipArrow])
    const jumpToEndHandler = useMemo(() => handleSkipArrow('end'), [handleSkipArrow])

    const playPauseHandler = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
        dispatch({type: 'TOGGLE_PLAYBACK'})
    }, [dispatch])

    const reverseDirectionHandler = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
        dispatch({type: 'REVERSE_REPLAY_RATE'})
    }, [dispatch])

    const syncWindowHandler = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
        dispatch({type: 'TOGGLE_WINDOW_SYNC'})
    }, [dispatch])

    const cropWindowHandler = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
        dispatch({type: 'COMMIT_WINDOW'})
    }, [dispatch])

    const fineAdjustmentHandler = useCallback((e: React.KeyboardEvent) => {
        // This may be ill-advised
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
        dispatch({
            type: 'SKIP',
            backward: e.key === 'ArrowLeft',
            fineSteps: 1,
            frameByFrame: e.ctrlKey
        })
    }, [dispatch])

    const keyboardControlHandler = useCallback((e: React.KeyboardEvent) => {
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowRight':
                fineAdjustmentHandler(e)
                break
            case ' ':
                playPauseHandler(e)
                break
            default:
                return
        }
    }, [fineAdjustmentHandler, playPauseHandler])

    return { returnToBeginningHandler, backSkipHandler, forwardSkipHandler, jumpToEndHandler,
            playPauseHandler, reverseDirectionHandler, syncWindowHandler, cropWindowHandler,
            keyboardControlHandler }
}

export default usePlaybackControlButtonLogic