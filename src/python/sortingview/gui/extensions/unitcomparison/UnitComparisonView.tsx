import Splitter from 'labbox-react/components/Splitter/Splitter';
import React, { FunctionComponent, useMemo, useState } from 'react';
import SelectUnitsWidget from '../../commonComponents/SelectUnitsWidget/SelectUnitsWidget';
import { SortingSelection, SortingSelectionAction, SortingSelectionDispatch, SortingViewProps } from "../../pluginInterface";
import UnitComparisonWidget from './UnitComparisonWidget';

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

const UnitComparisonView: FunctionComponent<SortingViewProps> = ({recording, sorting, selection, curation, selectionDispatch, width, height, snippetLen}) => {

    // Make a local selection/selectionDispatch pair that overrides the selectedUnitIds
    const [selectionLocal, selectionDispatchLocal] = useLocalUnitIds(selection, selectionDispatch)

    const selectedUnitIds = useMemo(() => {
        return selectionLocal.selectedUnitIds || []
    }, [selectionLocal])

    return (
        <Splitter
            width={width || 600}
            height={height || 900} // how to determine default height?
            initialPosition={200}
        >
            <SelectUnitsWidget sorting={sorting} selection={selectionLocal} selectionDispatch={selectionDispatchLocal} curation={curation} />
            {
                selectedUnitIds.length === 2 ? (
                    <UnitComparisonWidget
                        recording={recording}
                        sorting={sorting}
                        selection={selection}
                        unitIds={selectedUnitIds}
                        curation={curation}
                        selectionDispatch={selectionDispatch}
                        snippetLen={snippetLen}
                        width={0} // will be filled in by the splitter
                        height={0} // will be filled in by the splitter
                    />
                ) : (
                    <div>You must select exactly two units.</div>
                )
            }
        </Splitter>
    )
}

export default UnitComparisonView