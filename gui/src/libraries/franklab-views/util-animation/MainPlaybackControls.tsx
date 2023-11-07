import AnimationControlButtonContainer from './AnimationControlButtonContainer'
import './AnimationControlButtonStyles.css'
import PlaybackChangeDirectionButton from './AnimationControls/PlaybackChangeDirectionButton'
import { PlaybackControlLogic } from './AnimationControls/PlaybackControlButtonLogic'
import PlaybackPlayPauseButton from './AnimationControls/PlaybackPlayPauseButton'
import usePlaybackPositionArrowButtons from './AnimationControls/PlaybackPositionArrowButtons'
import PlaybackRateButtons from './AnimationControls/PlaybackRateButtons'
import PlaybackRateDropdown from './AnimationControls/PlaybackRateDropdown'
import { ControlFeatures } from './AnimationPlaybackControls'
import { AnimationStateDispatcher } from './AnimationStateReducer'

export type AnimationStateControlButtonsProps = {
    height: number
    dispatch: AnimationStateDispatcher<any>
    isPlaying: boolean
    buttonWidthPx: number
    playbackRate: number
    logic: PlaybackControlLogic
    ui?: ControlFeatures
}


const MainPlaybackControls = (props: AnimationStateControlButtonsProps) => {
    const { height, logic, buttonWidthPx, ui, isPlaying, playbackRate } = props

    const rateDropdown = <PlaybackRateDropdown {...props} />
    const rateButtons = <PlaybackRateButtons {...props} />
    const rateControl = ui?.usingRateButtons ? rateButtons : rateDropdown

    const playPauseButton = <PlaybackPlayPauseButton playPauseHandler={logic.playPauseHandler} isPlaying={isPlaying} />
    const changeDirectionButton = <PlaybackChangeDirectionButton reverseDirectionHandler={logic.reverseDirectionHandler} playbackRate={playbackRate} />

    const { beginningButton, endButton, forwardSkipButton, backSkipButton } = usePlaybackPositionArrowButtons(logic)

    return (
        // Note, this one doesn't need to be squeezed when the dropdown is displayed, b/c that affects the layout
        <AnimationControlButtonContainer
            width={buttonWidthPx}
            baseHeight={height}
            squeezeHeight={ui?.usingRateButtons}
        >
            {beginningButton}
            {backSkipButton}
            {playPauseButton}
            {forwardSkipButton}
            {endButton}
            {rateControl}
            {changeDirectionButton}
        </AnimationControlButtonContainer>
    )
}

export default MainPlaybackControls
