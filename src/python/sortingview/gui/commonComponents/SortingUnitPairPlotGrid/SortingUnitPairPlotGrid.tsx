import { Grid } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import { Sorting, SortingSelection, SortingSelectionDispatch } from "../../pluginInterface";

type Props = {
    sorting: Sorting
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    unitIds: number[]
    unitPairComponent: (unitId1: number, unitId2: number) => React.ReactElement
    sortingSelector?: string
}

const SortingUnitPairPlotGrid: FunctionComponent<Props> = ({ sorting, selection, selectionDispatch, unitIds, unitPairComponent, sortingSelector }) => {
    const maxNumUnits = 6
    if (unitIds.length > maxNumUnits) {
        return <span>Please select {maxNumUnits} or fewer units</span>
    }
    
    return (
        <Grid container spacing={0}>
            {
                unitIds.map(unitId1 => (
                    <Grid container key={unitId1}>
                        {
                            unitIds.map(unitId2 => (
                                <Grid key={unitId2} item>
                                    <div className='plotWrapperStyle'>
                                        <div
                                            data-unit-id1={unitId1}
                                            data-unit-id2={unitId2}
                                            // className={selection.selectedUnitIds?.includes(unitId1) ? 'plotSelectedStyle' : 'plotUnselectedStyle'}
                                            // onClick={handleUnitClick}
                                        >
                                            <div className='plotUnitLabel'>
                                                <div>Units {unitId1}{sortingSelector || ''} vs {unitId2}{sortingSelector || ''}</div>
                                            </div>
                                            {
                                                unitPairComponent(unitId1, unitId2)
                                            }
                                        </div>
                                    </div>
                                </Grid>
                            ))
                        }
                    </Grid>
                ))
            }
        </Grid>
    );
}

export default SortingUnitPairPlotGrid