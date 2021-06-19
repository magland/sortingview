import React, { FunctionComponent, useMemo, useState } from 'react'
import { SortingSelection, SortingSelectionAction, SortingSelectionDispatch, SortingViewProps } from "../../../pluginInterface"
import SelectUnitsWidget from '../../../commonComponents/SelectUnitsWidget/SelectUnitsWidget'
import CrossCorrelogramsWidget from './CrossCorrelogramsWidget'
import Splitter from 'labbox-react/components/Splitter/Splitter';

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

const CrossCorrelogramsView: FunctionComponent<SortingViewProps> = ({sorting, selection, curation, selectionDispatch, width, height}) => {

    // Make a local selection/selectionDispatch pair that overrides the selectedUnitIds
    const [selectionLocal, selectionDispatchLocal] = useLocalUnitIds(selection, selectionDispatch)

    return (
        <Splitter
            width={width || 600}
            height={height || 900} // how to determine default height?
            initialPosition={200}
        >
            <SelectUnitsWidget sorting={sorting} selection={selectionLocal} selectionDispatch={selectionDispatchLocal} curation={curation} />
            <CrossCorrelogramsWidget
                sorting={sorting}
                selection={selectionLocal}
                selectionDispatch={selectionDispatchLocal}
                curation={curation}
                unitIds={selectionLocal.selectedUnitIds || []}
                {...{width: 0, height: 0}} // filled in by splitter
            />
        </Splitter>
    )
}

export default CrossCorrelogramsView