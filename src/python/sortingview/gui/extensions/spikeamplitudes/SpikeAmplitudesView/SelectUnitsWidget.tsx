import { isMergeGroupRepresentative, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from 'python/sortingview/gui/pluginInterface';
import { useSortingInfo } from 'python/sortingview/gui/pluginInterface/useSortingInfo';
import React, { FunctionComponent } from 'react';
import UnitsTable from '../../unitstable/Units/UnitsTable';

type Props = {
    sorting: Sorting
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    curation: SortingCuration
    sortingSelector?: string
}

const SelectUnitsWidget: FunctionComponent<Props> = ({ sorting, selection, selectionDispatch, curation, sortingSelector }) => {
    const sortingInfo = useSortingInfo(sorting.sortingPath)
    if (!sortingInfo) return <div>No sorting info</div>
    let unitIds = (selection.visibleUnitIds || (sortingInfo?.unit_ids || []))
        .filter(uid => ((!selection.applyMerges) || (isMergeGroupRepresentative(uid, curation))))
    return (
        <UnitsTable
            units={unitIds}
            {...{selection, selectionDispatch, sorting, curation, sortingSelector}}
        />
    )
}

export default SelectUnitsWidget