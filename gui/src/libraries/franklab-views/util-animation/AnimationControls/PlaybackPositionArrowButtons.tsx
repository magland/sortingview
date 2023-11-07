import { faBackward, faFastBackward, faFastForward, faForward } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMemo } from 'react'
import { PlaybackControlLogic } from './PlaybackControlButtonLogic'

const usePlaybackPositionArrowButtons = (logic: PlaybackControlLogic) => {
    const {returnToBeginningHandler, backSkipHandler, forwardSkipHandler, jumpToEndHandler} = logic
    const beginningButton = useMemo(() => 
        <span onMouseDown={returnToBeginningHandler} title="Return to beginning">
            <FontAwesomeIcon icon={faFastBackward} />
        </span>, [returnToBeginningHandler])

    const backSkipButton = useMemo(() => 
        <span onMouseDown={backSkipHandler} title="Return to beginning">
            <FontAwesomeIcon icon={faBackward} />
        </span>, [backSkipHandler])

    const forwardSkipButton = useMemo(() => 
        <span onMouseDown={forwardSkipHandler} title="Skip forward">
            <FontAwesomeIcon icon={faForward} />
        </span>, [forwardSkipHandler])

    const endButton = useMemo(() => 
        <span onMouseDown={jumpToEndHandler} title="Skip to end">
            <FontAwesomeIcon icon={faFastForward} />
        </span>, [jumpToEndHandler])


    return { beginningButton, backSkipButton, forwardSkipButton, endButton }
}

export default usePlaybackPositionArrowButtons
