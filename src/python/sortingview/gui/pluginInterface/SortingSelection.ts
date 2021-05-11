import { Reducer } from "react"
import { RecordingSelection, RecordingSelectionAction, recordingSelectionReducer } from "./RecordingSelection"
import { isMergeGroupRepresentative, SortingCuration } from "./SortingCuration"

export interface SortingSelection extends RecordingSelection {
    selectedUnitIds?: number[]
    visibleUnitIds?: number[] | null // null means all are selected
    applyMerges?: boolean
}

export type SortingSelectionDispatch = (action: SortingSelectionAction) => void

type SetSelectionSortingSelectionAction = {
    type: 'SetSelection',
    selection: SortingSelection
}

type SetSelectedUnitIdsSortingSelectionAction = {
    type: 'SetSelectedUnitIds',
    selectedUnitIds: number[]
}

type SetVisibleUnitIdsSortingSelectionAction = {
    type: 'SetVisibleUnitIds',
    visibleUnitIds: number[] | null
}

type SetSortingSelectionAction = {
    type: 'Set',
    state: SortingSelection
}

type UnitClickedSortingSelectionAction = {
    type: 'UnitClicked'
    unitId: number
    ctrlKey?: boolean
    shiftKey?: boolean
}

type ToggleApplyMergesSortingSelectionAction = {
    type: 'ToggleApplyMerges'
    curation?: SortingCuration // this is used to restrict the selected units when turning the apply merges on
}

export type SortingSelectionAction = SetSelectionSortingSelectionAction | SetSelectedUnitIdsSortingSelectionAction | SetVisibleUnitIdsSortingSelectionAction | UnitClickedSortingSelectionAction | SetSortingSelectionAction | ToggleApplyMergesSortingSelectionAction | RecordingSelectionAction

const unitClickedReducer = (state: SortingSelection, action: UnitClickedSortingSelectionAction): SortingSelection => {
    const unitId = action.unitId
    if (action.ctrlKey) {
        if ((state.selectedUnitIds || []).includes(unitId)) {
            return {
                ...state,
                selectedUnitIds: (state.selectedUnitIds || []).filter(uid => (uid !== unitId))
            }
        }
        else {
            return {
                ...state,
                selectedUnitIds: [...(state.selectedUnitIds || []), unitId]
            }
        }
    }
    // todo: restore anchor/shift-select behavior somewhere
    else {
        return {
            ...state,
            selectedUnitIds: [unitId]
        }
    }
}

export const sortingSelectionReducer: Reducer<SortingSelection, SortingSelectionAction> = (state: SortingSelection, action: SortingSelectionAction): SortingSelection => {
    if (action.type === 'SetSelection') {
        return action.selection
    }
    else if (action.type === 'SetSelectedUnitIds') {
        return {
            ...state,
            selectedUnitIds: action.selectedUnitIds.filter(uid => ((!state.visibleUnitIds) || (state.visibleUnitIds?.includes(uid))))
        }
    }
    else if (action.type === 'SetVisibleUnitIds') {
        return {
            ...state,
            selectedUnitIds: state.selectedUnitIds ? state.selectedUnitIds.filter(uid => action.visibleUnitIds?.includes(uid)) : undefined,
            visibleUnitIds: action.visibleUnitIds
        }
    }
    else if (action.type === 'UnitClicked') {
        return unitClickedReducer(state, action)
    }
    else if (action.type === 'Set') {
        return action.state
    }
    else if (action.type === 'ToggleApplyMerges') {
        return adjustSelectedUnitIdsBasedOnMerges({
            ...state,
            applyMerges: state.applyMerges ? false : true
        }, action.curation)
    }
    else {
        return recordingSelectionReducer(state, action)
    }
}

const adjustSelectedUnitIdsBasedOnMerges = (state: SortingSelection, curation?: SortingCuration): SortingSelection => {
    return (state.applyMerges && curation) ? (
        {
            ...state,
            selectedUnitIds: state.selectedUnitIds ? state.selectedUnitIds.filter(uid => (isMergeGroupRepresentative(uid, curation))) : undefined
        }
    ) : state
}