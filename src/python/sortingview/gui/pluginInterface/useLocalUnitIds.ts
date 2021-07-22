import { useEffect, useMemo, useState } from 'react'
import { SortingSelection, SortingSelectionAction, SortingSelectionDispatch } from "./"

const useLocalUnitIds = (selection: SortingSelection, selectionDispatch: SortingSelectionDispatch, usingLocal: boolean = false):
                        [SortingSelection, SortingSelectionDispatch] => {
    const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([])
    useEffect(() => {
        if (!usingLocal) {
            // keep the local selection in sync with global so that
            // it has the correct value when if we switch to local
            setSelectedUnitIds(selection.selectedUnitIds || [])
        }
    }, [usingLocal, selection.selectedUnitIds])

    const selectionLocal: SortingSelection = useMemo(() => ({
        ...selection,
        selectedUnitIds
    }), [selection, selectedUnitIds])

    const selectionDispatchLocal = useMemo(() => ((action: SortingSelectionAction) => {
        if (action.type === 'SetSelectedUnitIds') {
            setSelectedUnitIds(action.selectedUnitIds.sort())
        }
    }), [])

    if (usingLocal) return [selectionLocal, selectionDispatchLocal]
    else return [selection, selectionDispatch]
}

export default useLocalUnitIds

// Usage example:
// // Make a local selection/selectionDispatch pair that overrides the selectedUnitIds
// const [selectionLocal, selectionDispatchLocal] = useLocalUnitIds(selection, selectionDispatch)
//
// const selectedUnitIds = useMemo(() => {
//     return selectionLocal.selectedUnitIds || []
// }, [selectionLocal])
