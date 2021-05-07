import React, { useMemo } from 'react';
import SortingUnitPlotGrid from '../common/SortingUnitPlotGrid';
import { SortingViewProps } from "../pluginInterface";
import CorrelogramRv2 from './Correlogram_ReactVis2';

// const autocorrelogramsCalculationPool = createCalculationPool({maxSimultaneous: 6});

const AutoCorrelograms: React.FunctionComponent<SortingViewProps> = ({ sorting, selection, curation, selectionDispatch }) => {
    const unitComponent = useMemo(() => (unitId: number) => (
        <CorrelogramRv2
            {...{sorting, unitId1: unitId, selection, curation, selectionDispatch}}
            width={180}
            height={180}
        />
    ), [sorting, selection, selectionDispatch])

    return (
        <SortingUnitPlotGrid
            sorting={sorting}
            selection={selection}
            curation={curation}
            selectionDispatch={selectionDispatch}
            unitComponent={unitComponent}
        />
    )
    // return (
    //     <PlotGrid
    //         sorting={sorting}
    //         selections={selectedUnitIdsLookup}
    //         onUnitClicked={handleUnitClicked}
    //         dataFunctionName={'createjob_fetch_correlogram_plot_data'}
    //         dataFunctionArgsCallback={(unitId: number) => ({
    //             sorting_object: sorting.sortingObject,
    //             unit_x: unitId
    //         })}
    //         // use default boxSize
    //         plotComponent={Correlogram_rv}
    //         plotComponentArgsCallback={(unitId: number) => ({
    //             id: 'plot-'+unitId
    //         })}
    //         calculationPool={autocorrelogramsCalculationPool}
    //     />
    // );
}

export default AutoCorrelograms