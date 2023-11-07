import { useCallback, useMemo } from 'react'
import Select from 'react-select'
import '../AnimationControlButtonStyles.css'
import { ControlFeatures } from '../AnimationPlaybackControls'
import { AnimationStateDispatcher } from '../AnimationStateReducer'

type PlaybackRateDropdownProps = {
    dispatch: AnimationStateDispatcher<any>
    playbackRate: number
    ui?: ControlFeatures
}

const defaultPlaybackRates = [0.1, 0.125, 0.25, 0.5, 1, 2, 3, 4, 5, 10 ]
const PlaybackRateDropdown = (props: PlaybackRateDropdownProps) => {
    const { playbackRate, ui, dispatch } = props
    const playbackRates = useMemo(() => {
        const c = ui?.customPlaybackRates || []
        return [...new Set([...defaultPlaybackRates, ...c])].sort((a: number, b: number) => a - b)
    }, [ui?.customPlaybackRates])
    const playbackRateOptions = useMemo(() => {
        return playbackRates.map(
            r => {return {
                value: r,
                label: `${r.toString().slice(0, 5)}x`
            }}
        )
    }, [playbackRates])
    const selectedRateOption = useMemo(() => {
        return playbackRateOptions.find(e => Math.abs(e.value - Math.abs(playbackRate)) < 0.001) || null
    }, [playbackRateOptions, playbackRate])

    const handleChangePlaybackRateOption = useCallback((selectedOption: any) => {
        dispatch({
            type: 'SET_REPLAY_RATE',
            newRate: (playbackRate > 0 ? 1 : -1) * selectedOption.value
        })
    }, [dispatch, playbackRate])

    const span = useMemo(() => {
        return (
            <span>
                <Select
                    value={selectedRateOption}
                    options={playbackRateOptions}
                    onChange={handleChangePlaybackRateOption}
                    classNamePrefix="dropdown"
                    className="dropdown-inline"
                    components={{ IndicatorsContainer: () => null }}
                    menuPlacement="top"
                />
            </span>
        )
    }, [selectedRateOption, playbackRateOptions, handleChangePlaybackRateOption])

    return span
}

export default PlaybackRateDropdown
