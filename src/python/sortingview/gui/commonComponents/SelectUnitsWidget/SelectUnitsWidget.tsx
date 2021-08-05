import React, { FunctionComponent, useMemo } from 'react'
import UnitsTable from '../../extensions/unitstable/Units/UnitsTable'
import { isMergeGroupRepresentative, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from "../../pluginInterface"
import { useSortingInfo } from '../../pluginInterface/useSortingInfo'

type Props = {
    sorting: Sorting
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    curation?: SortingCuration
    selectionDisabled?: boolean
    sortingSelector?: string
}

const SelectUnitsWidget: FunctionComponent<Props> = ({ sorting, selection, selectionDispatch, curation, selectionDisabled, sortingSelector }) => {
    const sortingInfo = useSortingInfo(sorting.sortingPath)
    const unitIds = useMemo(() => (selection.visibleUnitIds || (sortingInfo?.unit_ids || []))
                            .filter(uid => ((!selection.applyMerges) || (isMergeGroupRepresentative(uid, curation)))),
                            [selection.visibleUnitIds, sortingInfo?.unit_ids, curation, selection.applyMerges])
    const selectedUnitIds = useMemo(() => selection.selectedUnitIds, [selection.selectedUnitIds])
    return sortingInfo ? <UnitsTable
                            units={unitIds}
                            {...{selectedUnitIds, selectionDispatch, curation, selectionDisabled, sortingSelector}}
                         />
                       : <div>No sorting info</div>
}

export default SelectUnitsWidget