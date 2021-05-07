import { CalculationPool } from 'labbox'
import React, { FunctionComponent } from 'react'
import ClientSidePlot from '../common/ClientSidePlot'
import { Sorting } from "../pluginInterface"
import Correlogram_rv from './Correlogram_ReactVis'


const AutocorrelogramSortingUnitView: FunctionComponent<{sorting: Sorting, unitId: number, calculationPool: CalculationPool}> = ({ sorting, unitId, calculationPool }) => {
    return (
        <ClientSidePlot
            dataFunctionName="createjob_fetch_correlogram_plot_data"
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