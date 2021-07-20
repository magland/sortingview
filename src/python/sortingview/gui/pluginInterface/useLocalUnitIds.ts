import { useMemo, useState } from 'react'
import { SortingSelection, SortingSelectionAction, SortingSelectionDispatch } from "./"

const useLocalUnitIds = (selection: SortingSelection, selectionDispatch: SortingSelectionDispatch): [SortingSelection, SortingSelectionDispatch] => {
    const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([])
    const selectionLocal: SortingSelection = useMemo(() => ({
        ...selection,
        selectedUnitIds
    }), [selectedUnitIds, selection])

    const selectionDispatchLocal = useMemo(() => ((action: SortingSelectionAction) => {
        if (action.type === 'SetSelectedUnitIds') {
            setSelectedUnitIds(action.selectedUnitIds)
        }
        else {
            selectionDispatch(action)
        }
    }), [selectionDispatch])
    return [selectionLocal, selectionDispatchLocal]
}

export default useLocalUnitIds

// Usage example:
// // Make a local selection/selectionDispatch pair that overrides the selectedUnitIds
// const [selectionLocal, selectionDispatchLocal] = useLocalUnitIds(selection, selectionDispatch)
//
// const selectedUnitIds = useMemo(() => {
//     return selectionLocal.selectedUnitIds || []
// }, [selectionLocal])
