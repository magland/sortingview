import { createContext, useContext } from 'react'
import { ValidColorMap } from '../util-color-scales/ColorScales'

export type StyleSettings = {
    colorMap: ValidColorMap
    colorMapRangeMax: number
}

export type StyleSettingsDispatch = (action: StyleSettingsAction) => void

export const isStyleSettings = (object: any): object is StyleSettings => {
    if ("colorMapRangeMax" in object) {
        const rangeMax = object.colorMapRangeMax
        if (typeof rangeMax !== "number") return false
        if (rangeMax > 256 || rangeMax < 1) return false
    }
    return true
}

export const defaultStyleSettings = {
    colorMap: 'viridis' as ValidColorMap,
    colorMapRangeMax: 128
}

export type SetRangeMaxStyleSettingsAction = {
    type: 'SET_RANGE_MAX',
    max: number
}

export type SetColorMapStyleSettingsAction = {
    type: 'SET_COLOR_MAP',
    colorMap: ValidColorMap
}

export type StyleSettingsAction = SetRangeMaxStyleSettingsAction | SetColorMapStyleSettingsAction

export const stubStyleSettingsDispatch: StyleSettingsDispatch = (action: StyleSettingsAction) => {}

type StyleSettingsContextType = {
    styleSettings: StyleSettings,
    styleSettingsDispatch: StyleSettingsDispatch
}

const StyleSettingsContext = createContext<StyleSettingsContextType>({
    styleSettings: defaultStyleSettings,
    styleSettingsDispatch: stubStyleSettingsDispatch
})

export const useStyleSettings = () => {
    const c = useContext(StyleSettingsContext)
    return c
}

export const styleSettingsReducer = (state: StyleSettings, action: StyleSettingsAction): StyleSettings => {
    switch (action.type) {
        case "SET_COLOR_MAP": {
            if (action.colorMap !== state.colorMap) {
                return { ...state, colorMap: action.colorMap }
            }
            break
        }
        case "SET_RANGE_MAX": {
            if (action.max !== state.colorMapRangeMax) {
                return { ...state, colorMapRangeMax: action.max }
            }
            break
        }
        default: {
            console.warn(`Unsupported style-setting action requested. Can't happen.`)
            return state
        }
    }
    return state
}

export default StyleSettingsContext