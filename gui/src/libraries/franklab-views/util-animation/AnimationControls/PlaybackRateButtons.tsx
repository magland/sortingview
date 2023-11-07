import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useMemo } from 'react'
import '../AnimationControlButtonStyles.css'
import { AnimationStateDispatcher } from '../AnimationStateReducer'

type PlaybackButtonProps = {
    dispatch: AnimationStateDispatcher<any>
    playbackRate: number
}


const PlaybackRateButtons = (props: PlaybackButtonProps) => {
    const { dispatch, playbackRate } = props
    const handleChangePlaybackSpeed = useCallback((direction: 'faster' | 'slower') => {
        const newPlayback = direction === 'faster' ? playbackRate * 1.3 : playbackRate/1.3
        return (e: React.MouseEvent) => {
            dispatch({
                type: 'SET_REPLAY_RATE',
                newRate: newPlayback
            })
        }
    }, [dispatch, playbackRate])

    const resolution = useMemo(() => {
        return playbackRate > 0 ? 4 : 5
    }, [playbackRate])

    const final = useMemo(() => {
        return (
            <>
                <span>&nbsp;</span>
                <span title="Decrease playback rate">
                    <FontAwesomeIcon icon={faAngleDown} onMouseDown={handleChangePlaybackSpeed('slower')} />
                </span>
                <span title="Playback rate (frames per 1/60th of a second)">
                    {`${playbackRate.toString().substring(0, resolution)}`}
                </span>
                <span title="Increase playback rate">
                    <FontAwesomeIcon icon={faAngleUp} onMouseDown={handleChangePlaybackSpeed('faster')} />
                </span>
            </>
        )
    }, [handleChangePlaybackSpeed, playbackRate, resolution])

    return final
}

export default PlaybackRateButtons
