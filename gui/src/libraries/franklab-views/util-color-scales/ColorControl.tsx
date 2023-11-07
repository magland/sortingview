import Slider from '@material-ui/core/Slider'
import { createTheme, ThemeProvider } from '@material-ui/core/styles'
import { useCallback, useMemo } from 'react'
import Select from 'react-select'
import { StyleSettingsAction } from '../context-style-settings'
import { ValidColorMap, ValidColorMapNames } from './ColorScales'
import './Tooltip.css'

type ColorMapSelectorProps = {
    dispatch: React.Dispatch<StyleSettingsAction>
    colorMap: string
}

type ColorMapRangeProps = {
    dispatch: React.Dispatch<StyleSettingsAction>
    rangeMax: number
}

const MapSelector = (props: ColorMapSelectorProps) => {
    const { dispatch, colorMap } = props
    const mapOptions = useMemo(() => {
        return ValidColorMapNames.sort().map(
            n => {
                return {
                    value: n,
                    label: `${n[0].toUpperCase()}${n.toLowerCase().slice(1)}`
            }
        })
    }, [])
    const selectedMap = useMemo(() => {
        return mapOptions.find(o => o.value === colorMap) || null
    }, [mapOptions, colorMap])

    const handleChangeColorMapSelection = useCallback((selectedOption: any) => {
        dispatch({
            type: 'SET_COLOR_MAP',
            colorMap: selectedOption.value as ValidColorMap
        })
    }, [dispatch])

    const span = useMemo(() => {
        return (
            <span>
                <Select
                    value={selectedMap}
                    options={mapOptions}
                    onChange={handleChangeColorMapSelection}
                    classNamePrefix="dropdown"
                    className="dropdown-inline"
                    components={{ IndicatorsContainer: () => null }}
                    menuPlacement="top"
                />
            </span>
        )
    }, [selectedMap, mapOptions, handleChangeColorMapSelection])

    return span
}

const theme = createTheme({
    direction: 'rtl'
})

const RangeSelector = (props: ColorMapRangeProps) => {
    const { dispatch, rangeMax } = props
    const updateValue = useCallback((e: object, v: number | number[]) => {
        const _value = Array.isArray(v) ? v[1] : v
        if (_value < 0 || _value > 256) {
            console.warn(`Impossible value ${v} detected in color intensity range update. No-op.`)
            return
        }
        dispatch({
            type: 'SET_RANGE_MAX',
            max: _value
        })
    }, [dispatch])

    const sliderDiv = useMemo(() => {
        return (
            // <div className={sliderStyles.root}>
            <span className='tooltip' style={{width: "256px", display: "block", paddingLeft: "15px", paddingRight: "15px", paddingTop: "5px"}}>
                <ThemeProvider theme={theme}>
                    <Slider
                        aria-label="Color range maximum"
                        min={1}
                        max={256}
                        onChange={updateValue}
                        value={rangeMax}
                        valueLabelDisplay="auto"
                    />
                </ThemeProvider>
                <div className="tooltiptext">
                    Set the upper end of the dynamic range (1-256 scale). Values above this number will be compressed to max intensity.
                </div>
            </span>
        )
    }, [rangeMax, updateValue])

    return sliderDiv
}

type ColorControlProps = {
    dispatch: React.Dispatch<StyleSettingsAction>
    colorMap: ValidColorMap
    rangeMax: number
}

const ColorControl = (props: ColorControlProps) => {
    const { dispatch, colorMap, rangeMax } = props
    const dropdown = MapSelector({dispatch, colorMap})
    const slider = RangeSelector({dispatch, rangeMax})

    return (
        <span style={{paddingLeft: "15px", display: "inline-flex"}}>
            {slider}
            {dropdown}
        </span>
    )
}

export default ColorControl