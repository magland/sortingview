import { useMemo, useState } from 'react'
import { SortingSelection, SortingSelectionAction, SortingSelectionDispatch } from "./"

const useLocalUnitIds = (selection: SortingSelection, selectionDispatch: SortingSelectionDispatch, usingLocal: boolean = false):
                        [SortingSelection, SortingSelectionDispatch] => {
    const globalSelectedIds = selection.selectedUnitIds ?? []
    const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>(globalSelectedIds)
    if (!usingLocal &&
            (selectedUnitIds.length !== globalSelectedIds.length ||
             !selectedUnitIds.every((e) => globalSelectedIds.includes(e)))
        ) {
            setSelectedUnitIds(globalSelectedIds.sort())
    }

    const selectionLocal: SortingSelection = useMemo(() => ({
        ...selection,
        selectedUnitIds
    }), [selection, selectedUnitIds])

    const selectionDispatchLocal = useMemo(() => ((action: SortingSelectionAction) => {
        if (usingLocal && action.type === 'SetSelectedUnitIds') {
            setSelectedUnitIds(action.selectedUnitIds.sort())
        }
        else {
            selectionDispatch(action)
        }
    }), [usingLocal, selectionDispatch])
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
