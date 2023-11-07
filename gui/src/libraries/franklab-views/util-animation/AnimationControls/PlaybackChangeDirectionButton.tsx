import { faStepBackward, faStepForward } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMemo } from 'react'
import '../AnimationControlButtonStyles.css'
import { PlaybackButtonLogicCallback } from './PlaybackControlButtonLogic'

export type PlaybackChangeDirectionButtonProps = {
    reverseDirectionHandler: PlaybackButtonLogicCallback
    playbackRate: number
}


const PlaybackChangeDirectionButton = (props: PlaybackChangeDirectionButtonProps) => {
    const { reverseDirectionHandler, playbackRate } = props

    // Alternatively, consider the faArrowRightArrowLeft icon, which wouldn't need to be changed and might be more expressive.
    const directionIcon = useMemo(() => {
        return playbackRate < 0 ? <FontAwesomeIcon icon={faStepBackward} /> : <FontAwesomeIcon icon={faStepForward} />
    }, [playbackRate])

    const button = useMemo(() => {
        return (
            <span onMouseDown={reverseDirectionHandler} title="Reverse playback direction">
                {directionIcon}
            </span>
        )
    }, [reverseDirectionHandler, directionIcon])

    return button
}

export default PlaybackChangeDirectionButton
