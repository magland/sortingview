import React, { FunctionComponent } from 'react';
import UnitsTable from '../../extensions/unitstable/Units/UnitsTable';
import { isMergeGroupRepresentative, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from "../../pluginInterface";
import { useSortingInfo } from '../../pluginInterface/useSortingInfo';

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
    if (!sortingInfo) return <div>No sorting info</div>
    let unitIds = (selection.visibleUnitIds || (sortingInfo?.unit_ids || []))
        .filter(uid => ((!selection.applyMerges) || (isMergeGroupRepresentative(uid, curation))))
    return (
        <UnitsTable
            units={unitIds}
            {...{selection, selectionDispatch, sorting, curation, selectionDisabled, sortingSelector}}
        />
    )
}

export default SelectUnitsWidget