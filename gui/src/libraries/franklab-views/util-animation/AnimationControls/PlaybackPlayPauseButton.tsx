import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMemo } from 'react'
import '../AnimationControlButtonStyles.css'
import { PlaybackButtonLogicCallback } from './PlaybackControlButtonLogic'

type PlaybackPlayPauseButtonProps = {
    playPauseHandler: PlaybackButtonLogicCallback
    isPlaying: boolean
}

const PlaybackPlayPauseButton = (props: PlaybackPlayPauseButtonProps) => {
    const { playPauseHandler, isPlaying } = props

    const playPauseIcon = useMemo(() => {
        return isPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />
    }, [isPlaying])

    const button = useMemo(() => {
        return (
            <span onMouseDown={playPauseHandler} title="Play/pause (space bar)">
                {playPauseIcon}
            </span>
        )
    }, [playPauseHandler, playPauseIcon])

    return button
}

export default PlaybackPlayPauseButton
