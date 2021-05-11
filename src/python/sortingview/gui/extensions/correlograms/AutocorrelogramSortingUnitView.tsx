import React, { FunctionComponent } from 'react'
import ClientSidePlot from '../../commonComponents/ClientSidePlot/ClientSidePlot'
import { CalculationPool } from '../../labbox'
import { Sorting } from "../../pluginInterface"
import Correlogram_rv from './Correlogram_ReactVis'


const AutocorrelogramSortingUnitView: FunctionComponent<{sorting: Sorting, unitId: number, calculationPool: CalculationPool}> = ({ sorting, unitId, calculationPool }) => {
    return (
        <ClientSidePlot
            dataFunctionName="fetch_correlogram_plot_data.1"
            dataFunctionArgs={{
                sorting_object: sorting.sortingObject,
                unit_x: unitId
            }}
            boxSize={{
                width: 300,
                height: 300
            }}
            title="Autocorrelogram"
            PlotComponent={Correlogram_rv}
            plotComponentArgs={{ id: unitId }}
            calculationPool={calculationPool}
        />
    )
}

export default AutocorrelogramSortingUnitView