import { useMemo } from 'react'
import AnimationControlButtonContainer from './AnimationControlButtonContainer'
import PlaybackBookmarkButton, { BOOKMARK_BUTTON } from './AnimationControls/PlaybackBookmarkButton'
import { PlaybackControlLogic } from './AnimationControls/PlaybackControlButtonLogic'
import PlaybackCropWindowButton, { CROP_BUTTON } from './AnimationControls/PlaybackCropWindowButton'
import PlaybackSyncWindowButton, { SYNC_BUTTON } from './AnimationControls/PlaybackSyncWindowButton'
import { ControlFeatures } from './AnimationPlaybackControls'


const perButtonRightButtonSpacingPx = 35

type SecondaryControlButtonsProps = {
    width: number
    height: number
    logic: PlaybackControlLogic
    ui?: ControlFeatures
}

const GetSecondaryPlaybackControls = (props: SecondaryControlButtonsProps) => {
    const { width, height, logic, ui } = props

    const rightButtonCount = useMemo(() => {
        return (ui?.optionalButtons?.length || 0)
    }, [ui?.optionalButtons])
    const rightButtonSpacingPx = rightButtonCount * perButtonRightButtonSpacingPx

    const selectedButtons = useMemo(() => new Set(ui?.optionalButtons), [ui?.optionalButtons])
    // TODO: Consider if this could result in building expensive buttons that aren't actually used.
    const syncButton = PlaybackSyncWindowButton({syncWindowHandler: logic.syncWindowHandler, isSynced: (ui?.isSynced ?? false)})
    const cropButton = PlaybackCropWindowButton({
        cropWindowHandler: logic.cropWindowHandler,
        isSynced: (ui?.isSynced ?? false),
        isCropped: (ui?.isCropped ?? false),
        willCrop: (ui?.couldCrop ?? false)
    }) // TODO: Add range for display ?
    const bookmarkButton = PlaybackBookmarkButton({
        handleSave: (ui?.doBookmark === undefined ? () => {} : ui.doBookmark),
        stateIsSaved: (ui?.stateIsBookmarked ?? false)
    })

    const panel = useMemo(() => {
        return ( 
            <AnimationControlButtonContainer
                 width={rightButtonSpacingPx}
                 baseHeight={height}
                 squeezeHeight={true}
                 overallWidth={width}
             >
                {selectedButtons.has(SYNC_BUTTON) && syncButton}
                {selectedButtons.has(CROP_BUTTON) && cropButton}
                {selectedButtons.has(BOOKMARK_BUTTON) && bookmarkButton}
             </AnimationControlButtonContainer>
        )
    }, [rightButtonSpacingPx, height, width, syncButton, cropButton, bookmarkButton, selectedButtons])

    return { panelWidth: rightButtonSpacingPx, panel }
}

export default GetSecondaryPlaybackControls
