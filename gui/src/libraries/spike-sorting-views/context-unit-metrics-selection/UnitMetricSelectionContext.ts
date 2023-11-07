import React, { useContext, useMemo } from "react"

export type UnitMetricSelection = {
    selectedUnitMetrics?: string[]
    allUnitMetrics?: string[]
}

export type UnitMetricSelectionAction = {
    type: 'selectUnitMetrics',
    unitMetrics: string[]
} | {
    type: 'initialize',
    unitMetrics: string[]
}

export const unitMetricSelectionReducer = (state: UnitMetricSelection, action: UnitMetricSelectionAction): UnitMetricSelection => {
    if (action.type === 'selectUnitMetrics') {
        return {
            ...state,
            selectedUnitMetrics: action.unitMetrics
        }
    }
    else if (action.type === 'initialize') {
        return {
            ...state,
            allUnitMetrics: [...new Set([...(state.allUnitMetrics || []), ...action.unitMetrics])].sort()
        }
    }
    else return state
}

const UnitMetricSelectionContext = React.createContext<{
    unitMetricSelection?: UnitMetricSelection,
    unitMetricSelectionDispatch?: (action: UnitMetricSelectionAction) => void
}>({})

export const useUnitMetricSelection = () => {
    const c = useContext(UnitMetricSelectionContext)
    const unitMetricSelectionDispatch = useMemo(() => (
        c.unitMetricSelectionDispatch || ((action: UnitMetricSelectionAction) => {})
    ), [c.unitMetricSelectionDispatch])
    return {
        selectedUnitMetrics: c.unitMetricSelection?.selectedUnitMetrics || [],
        allUnitMetrics: c.unitMetricSelection?.allUnitMetrics || [],
        unitMetricSelectionDispatch
    }
}

export default UnitMetricSelectionContext