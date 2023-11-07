import { faLink, faLinkSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMemo } from 'react'
import { PlaybackButtonLogicCallback } from './PlaybackControlButtonLogic'


export const SYNC_BUTTON = "syncButton"

type PlaybackSyncButtonProps = {
    syncWindowHandler: PlaybackButtonLogicCallback
    isSynced: boolean
}

const PlaybackSyncWindowButton = (props: PlaybackSyncButtonProps) => {
    const { syncWindowHandler, isSynced } = props

    const syncButton = useMemo(() => 
        <span onMouseDown={syncWindowHandler}
          title={isSynced
            ? "Unsync playback bar from global time range"
            : "Sync playback bar to global time range"}
        >
            {isSynced ? <FontAwesomeIcon icon={faLink} /> : <FontAwesomeIcon icon={faLinkSlash} />}
        </span>
        , [isSynced, syncWindowHandler])

    return syncButton
}

export default PlaybackSyncWindowButton
