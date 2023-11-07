import { faArrowsLeftRightToLine } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMemo } from 'react'
import { PlaybackButtonLogicCallback } from './PlaybackControlButtonLogic'


export const CROP_BUTTON = "cropButton"

type PlaybackCropWindowButtonProps = {
    cropWindowHandler: PlaybackButtonLogicCallback
    isSynced: boolean
    isCropped: boolean
    willCrop: boolean
}

const PlaybackCropWindowButton = (props: PlaybackCropWindowButtonProps) => {
    const { cropWindowHandler, isSynced, isCropped, willCrop } = props

    const cropButton = useMemo(() =>
        <span className={isSynced ? 'Inactive' : isCropped ? 'Highlighted' : ''}
            title={isSynced
                ? "Playback range syncing is on--playback is automatically limited to global state"
                : willCrop
                    ? "Limit playback bar range to current selection"
                    : isCropped
                        ? "Show complete animation duration in playback bar"
                        : "Drag-click in the playback bar to select a focus range" }
            onMouseDown={cropWindowHandler}
          >
            <FontAwesomeIcon icon={faArrowsLeftRightToLine} />
            {/* <FontAwesomeIcon icon={faCrop} /> */}
          </span>
    , [isSynced, isCropped, willCrop, cropWindowHandler])

    return cropButton
}

export default PlaybackCropWindowButton
