import { Button, Grid } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { isMergeGroupRepresentative, Sorting, SortingCuration, SortingInfo, SortingSelection, SortingSelectionDispatch } from "../../pluginInterface";
import { useSortingInfo } from '../../pluginInterface/useSortingInfo';

type Props = {
    sorting: Sorting
    selection: SortingSelection
    curation?: SortingCuration
    selectionDispatch: SortingSelectionDispatch
    unitComponent: (unitId: number) => React.ReactElement
    sortingSelector?: string
}

const SortingUnitPlotGrid: FunctionComponent<Props> = ({ sorting, selection, curation, selectionDispatch, unitComponent, sortingSelector }) => {
    const maxUnitsVisibleIncrement = 60;
    const [maxUnitsVisible, setMaxUnitsVisible] = useState(30);
    const sortingInfo: SortingInfo | undefined = useSortingInfo(sorting.sortingPath)

    const visibleUnitIds = useMemo(() => selection.visibleUnitIds, [selection.visibleUnitIds])
    const selectedUnitIds = useMemo(() => selection.selectedUnitIds, [selection.selectedUnitIds])
    const applyMerges = useMemo(() => selection.applyMerges, [selection.applyMerges])
    const baseUnitIds: number[] = useMemo(() => {
        return (sortingInfo ? sortingInfo.unit_ids : [])
                .filter(uid => ((!visibleUnitIds) || (visibleUnitIds.includes(uid))))
                .filter(uid => ((!applyMerges) || (isMergeGroupRepresentative(uid, curation))))
    }, [curation, applyMerges, sortingInfo, visibleUnitIds])
    const showExpandButton = useMemo(() => baseUnitIds.length > maxUnitsVisible, [baseUnitIds, maxUnitsVisible])
    const unit_ids = useMemo(() => showExpandButton ? baseUnitIds.slice(0, maxUnitsVisible) : baseUnitIds, [showExpandButton, baseUnitIds, maxUnitsVisible])

    const handleUnitClick = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const unitId = Number(event.currentTarget.dataset.unitId)
        selectionDispatch({type: 'UnitClicked', unitId, ctrlKey: event.ctrlKey, shiftKey: event.shiftKey})
    }, [selectionDispatch])

    return (
        <Grid container>
            {
                unit_ids.map(unitId => (
                    <Grid key={unitId} item>
                        <div className='plotWrapperStyle'
                        >
                            <div
                                data-unit-id={unitId}
                                className={selectedUnitIds?.includes(unitId) ? 'plotSelectedStyle' : 'plotUnselectedStyle'}
                                onClick={handleUnitClick}
                            >
                                <div className='plotUnitLabel'>
                                    <div>Unit {unitId}{sortingSelector || ''}</div>
                                </div>
                                {
                                    unitComponent(unitId)
                                }
                                {/* <ClientSidePlot
                                    dataFunctionName={dataFunctionName}
                                    dataFunctionArgs={dataFunctionArgsCallback(unitId)}
                                    boxSize={boxSize}
                                    PlotComponent={plotComponent}
                                    plotComponentArgs={plotComponentArgsCallback(unitId)}
                                    plotComponentProps={plotComponentPropsCallback ? plotComponentPropsCallback(unitId): undefined}
                                    calculationPool={calculationPool}
                                    title=""
                                    hither={hither}
                                /> */}
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

export default SortingUnitPlotGrid