import React, { FunctionComponent, useMemo } from 'react'
import SortingUnitPlotGrid from '../../../commonComponents/SortingUnitPlotGrid/SortingUnitPlotGrid'
import { SortingViewProps } from '../../../pluginInterface'
import IndividualClusterView from './IndividualClusterView'

const IndividualClustersView: FunctionComponent<SortingViewProps> = ({recording, sorting, curation, selection, selectionDispatch}) => {
    const unitComponent = useMemo(() => (unitId: number) => (
        <IndividualClusterView
            {...{recording, sorting, curation, unitId, selection, selectionDispatch}}
            width={180}
            height={180}
        />
    ), [sorting, recording, selection, selectionDispatch, curation])

    return (
        <SortingUnitPlotGrid
            sorting={sorting}
            selection={selection}
            curation={curation}
            selectionDispatch={selectionDispatch}
            unitComponent={unitComponent}
        />
    )
}

export default IndividualClustersView