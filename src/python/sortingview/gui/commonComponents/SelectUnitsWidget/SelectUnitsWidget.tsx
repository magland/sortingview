import React, { FunctionComponent } from 'react';
import { isMergeGroupRepresentative, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from "../../pluginInterface";
import { SortingInfo } from '../../pluginInterface';
import UnitsTable from '../../extensions/unitstable/Units/UnitsTable';

type Props = {
    sorting: Sorting
    sortingInfo: SortingInfo
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    curation: SortingCuration
}

const SelectUnitsWidget: FunctionComponent<Props> = ({ sorting, sortingInfo, selection, selectionDispatch, curation }) => {
    if (!sortingInfo) return <div>No sorting info</div>
    const unitIds = (sortingInfo?.unit_ids || [])
        .filter(uid => ((!selection.applyMerges) || (isMergeGroupRepresentative(uid, curation))))
    return (
        <UnitsTable
            units={unitIds}
            {...{selection, selectionDispatch, sorting, curation}}
        />
    )
}

export default SelectUnitsWidget