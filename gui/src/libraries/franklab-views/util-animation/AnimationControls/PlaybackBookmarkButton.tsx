import { faBookmark as hollow } from '@fortawesome/free-regular-svg-icons'
import { faBookmark as solid } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useMemo } from 'react'


export const BOOKMARK_BUTTON = "bookmarkButton"

type PlaybackSyncButtonProps = {
    handleSave: () => void
    stateIsSaved: boolean
}

const solidIcon = <FontAwesomeIcon icon={solid} />
const hollowIcon = <FontAwesomeIcon icon={hollow} />

const PlaybackBookmarkButton = (props: PlaybackSyncButtonProps) => {
    const { handleSave, stateIsSaved } = props

    const onClick = useCallback((e: React.MouseEvent) => {
        handleSave()
    }, [handleSave])

    const syncButton = useMemo(() => 
        <span onMouseDown={onClick}
          className={stateIsSaved ? 'Highlighted' : ''}
          title={stateIsSaved
            ? "Current playback state has been saved"
            : "Bookmark this playback state"}
        >
            {stateIsSaved ? solidIcon : hollowIcon}
        </span>
        , [stateIsSaved, onClick])

    return syncButton
}

export default PlaybackBookmarkButton
