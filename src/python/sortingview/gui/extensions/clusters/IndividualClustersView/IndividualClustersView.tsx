import React, { FunctionComponent, useMemo } from 'react'
import SortingUnitPlotGrid from '../../../commonComponents/SortingUnitPlotGrid/SortingUnitPlotGrid'
import { SortingViewProps } from '../../../pluginInterface'
import IndividualClusterView from './IndividualClusterView'

const IndividualClustersView: FunctionComponent<SortingViewProps> = ({recording, sorting, curation, selection, selectionDispatch, snippetLen, sortingSelector}) => {
    const unitComponent = useMemo(() => (unitId: number) => (
        <IndividualClusterView
            {...{recording, sorting, curation, unitId, selection, selectionDispatch, snippetLen}}
            width={180}
            height={180}
        />
    ), [sorting, recording, selection, selectionDispatch, curation, snippetLen])

    return (
        <SortingUnitPlotGrid
            sorting={sorting}
            selection={selection}
            curation={curation}
            selectionDispatch={selectionDispatch}
            unitComponent={unitComponent}
            sortingSelector={sortingSelector}
        />
    )
}

export default IndividualClustersView