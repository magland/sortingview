import Splitter from 'figurl/labbox-react/components/Splitter/Splitter';
import useLocalUnitIds from 'python/sortingview/gui/pluginInterface/useLocalUnitIds';
import React, { FunctionComponent, useState } from 'react';
import LockableSelectUnitsWidget from '../../../commonComponents/SelectUnitsWidget/LockableSelectUnitsWidget';
import { SortingViewProps } from "../../../pluginInterface";
import CrossCorrelogramsWidget from './CrossCorrelogramsWidget';

const CrossCorrelogramsView: FunctionComponent<SortingViewProps> = ({sorting, selection, curation, selectionDispatch, width, height, sortingSelector}) => {
    const [locked, setLocked] = useState(false)
    // Make a local selection/selectionDispatch pair that overrides the selectedUnitIds
    const [selectionLocal, selectionDispatchLocal] = useLocalUnitIds(selection, selectionDispatch, locked)

    return (
        <Splitter
            width={width || 600}
            height={height || 900} // how to determine default height?
            initialPosition={200}
        >

            <LockableSelectUnitsWidget
                sorting={sorting}
                selection={selectionLocal}
                selectionDispatch={selectionDispatchLocal}
                curation={curation}
                locked={locked}
                toggleLockStateCallback={() => setLocked(!locked)}
                sortingSelector={sortingSelector}
            />
            <CrossCorrelogramsWidget
                sorting={sorting}
                selection={selectionLocal}
                selectionDispatch={selectionDispatchLocal}
                curation={curation}
                unitIds={selectionLocal.selectedUnitIds || []}
                {...{width: 0, height: 0}} // filled in by splitter
                sortingSelector={sortingSelector}
            />
        </Splitter>
    )
}

export default CrossCorrelogramsView