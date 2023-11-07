import { FunctionComponent, PropsWithChildren, useMemo, useReducer } from 'react'
import StyleSettingsContext, { defaultStyleSettings, styleSettingsReducer } from './StyleSettingsContext'

const SetupStyleSettings: FunctionComponent<PropsWithChildren> = (props) => {
    const [styleSettings, styleSettingsDispatch] = useReducer(styleSettingsReducer, defaultStyleSettings)
    const value = useMemo(() => ({styleSettings, styleSettingsDispatch}), [styleSettings, styleSettingsDispatch])
    // TODO: Invoke urlState to preserve our style settings in the URL.
    return (
        <StyleSettingsContext.Provider value={value}>
            {props.children}
        </StyleSettingsContext.Provider>
    )
}

export default SetupStyleSettings