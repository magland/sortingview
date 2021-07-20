
import Splitter from 'labbox-react/components/Splitter/Splitter';
import React, { FunctionComponent } from 'react';
import SelectUnitsWidget from '../../../commonComponents/SelectUnitsWidget/SelectUnitsWidget';
import { SortingViewProps } from "../../../pluginInterface";
import useLocalUnitIds from '../../../pluginInterface/useLocalUnitIds';
import CrossCorrelogramsWidget from './CrossCorrelogramsWidget';

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