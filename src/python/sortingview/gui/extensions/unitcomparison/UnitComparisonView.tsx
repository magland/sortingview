import Splitter from 'figurl/labbox-react/components/Splitter/Splitter'
import React, { FunctionComponent } from 'react'
import SelectUnitsWidget from '../../commonComponents/SelectUnitsWidget/SelectUnitsWidget'
import { SortingViewProps } from "../../pluginInterface"
import UnitComparisonWidget from './UnitComparisonWidget'

const UnitComparisonView: FunctionComponent<SortingViewProps> = ({recording, sorting, selection, curation, selectionDispatch, width, height, snippetLen, sortingSelector}) => {

    const selectedUnitIds = ((selection || {}).selectedUnitIds || [])

    return (
        <Splitter
            width={width || 600}
            height={height || 900} // how to determine default height?
            initialPosition={200}
        >
            <SelectUnitsWidget sorting={sorting} selection={selection} selectionDispatch={selectionDispatch} curation={curation} sortingSelector={sortingSelector} />
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
                        sortingSelector={sortingSelector}
                    />
                ) : (
                    <div>You must select exactly two units.</div>
                )
            }
        </Splitter>
    )
}

export default UnitComparisonView