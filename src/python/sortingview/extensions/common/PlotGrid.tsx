import { Button, Grid } from '@material-ui/core';
import { CalculationPool } from 'labbox';
import React, { FunctionComponent, useState } from 'react';
import { Sorting } from "../pluginInterface";
import ClientSidePlot from './ClientSidePlot';
import './localStyles.css';
import { useSortingInfo } from './useSortingInfo';

const isSelected = (query: string, selections: {[key: string]: boolean} = {}) => (selections[query] ? true : false);

interface Props {
    sorting: Sorting
    onUnitClicked?: (unitId: number, event: {ctrlKey?: boolean, shiftKey?: boolean}) => void
    selections: {[key: string]: boolean}
    dataFunctionName: string
    dataFunctionArgsCallback: any
    boxSize?: { width: number, height: number}
    plotComponent: React.FunctionComponent<any>
    plotComponentArgsCallback: any
    plotComponentPropsCallback?: any
    calculationPool: CalculationPool | undefined
}

const PlotGrid: FunctionComponent<Props> = ({ sorting, onUnitClicked, selections,
    dataFunctionName, dataFunctionArgsCallback, // fix this
    boxSize = { width: 200, height: 200},
    plotComponent, plotComponentArgsCallback, plotComponentPropsCallback, // fix this
    calculationPool = undefined
}) => {
        const maxUnitsVisibleIncrement = 60;
        const [maxUnitsVisible, setMaxUnitsVisible] = useState(30);
        const sortingInfo = useSortingInfo(sorting.sortingObject, sorting.recordingObject)

        let unit_ids: number[] = sortingInfo ? sortingInfo.unit_ids : []
        let showExpandButton = false;
        if (unit_ids.length > maxUnitsVisible) {
            unit_ids = unit_ids.slice(0, maxUnitsVisible);
            showExpandButton = true;
        }

        return (
            <Grid container>
                {
                    unit_ids.map(unitId => (
                        <Grid key={unitId} item>
                            <div className='plotWrapperStyle'
                            >
                                <div
                                    className={isSelected(unitId + '', selections) ? 'plotSelectedStyle' : 'plotUnselectedStyle'}
                                    onClick={(event) => {onUnitClicked && onUnitClicked(unitId, event)}}
                                >
                                    <div className='plotUnitLabel'>
                                        <div>Unit {unitId}</div>
                                    </div>
                                    <ClientSidePlot
                                        dataFunctionName={dataFunctionName}
                                        dataFunctionArgs={dataFunctionArgsCallback(unitId)}
                                        boxSize={boxSize}
                                        PlotComponent={plotComponent}
                                        plotComponentArgs={plotComponentArgsCallback(unitId)}
                                        plotComponentProps={plotComponentPropsCallback ? plotComponentPropsCallback(unitId): undefined}
                                        calculationPool={calculationPool}
                                        title=""
                                    />
                                </div>
                            </div>
                        </Grid>
                    ))
                }
                {
                    showExpandButton && (
                        <div className='plotWrapperStyle'>
                            <div className='plotWrapperStyleButton'>
                                <Button onClick={() => {setMaxUnitsVisible(maxUnitsVisible + maxUnitsVisibleIncrement)}}>Show more units</Button>
                            </div>
                        </div>
                        
                    )
                }
            </Grid>
        );
}


export default PlotGrid;