import { IconButton } from '@material-ui/core';
import { Help } from '@material-ui/icons';
import { useVisible } from 'figurl/labbox-react';
import MarkdownDialog from 'figurl/labbox-react/components/Markdown/MarkdownDialog';
import React, { Fragment, FunctionComponent, useMemo } from 'react';
import SortingUnitPairPlotGrid from '../../../commonComponents/SortingUnitPairPlotGrid/SortingUnitPairPlotGrid';
import correlogramSubsamplingInfo from '../../../helpPages/CorrelogramSubsamplingInfo.md.gen';
import { Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from "../../../pluginInterface";
import CorrelogramRv2 from '../Correlogram_ReactVis2';

type Props = {
    sorting: Sorting
    selection: SortingSelection
    curation?: SortingCuration
    selectionDispatch: SortingSelectionDispatch
    unitIds: number[]
    width: number
    height: number
    sortingSelector?: string
}

const plotMargin = 10 // in pixels

const CrossCorrelogramsWidget: FunctionComponent<Props> = ({ sorting, selection, curation, selectionDispatch, unitIds, width, height, sortingSelector }) => {
    const n = useMemo(() => (unitIds.length || 1), [unitIds.length])
    const plotWidth = useMemo(() => {return Math.min(240, (width - (plotMargin * (n + 1))) / n)}, [n, width])
    const plotHeight = plotWidth
    const applyMerges = useMemo(() => (selection.applyMerges || false), [selection.applyMerges])
    const unitPairComponent = useMemo(() => (unitId1: number, unitId2: number) => (
        <CorrelogramRv2
            sorting={sorting}
            applyMerges={applyMerges}
            curation={curation}
            unitId1={unitId1}
            unitId2={unitId2}
            width={plotWidth}
            height={plotHeight}
        />
    ), [applyMerges, sorting, plotWidth, plotHeight, curation])
    const subsamplingPopupVisible = useVisible()


    return (
        <Fragment>
            <div>
                <IconButton onClick={subsamplingPopupVisible.show}><Help /></IconButton>
            </div>
            <SortingUnitPairPlotGrid
                sorting={sorting}
                selection={selection}
                selectionDispatch={selectionDispatch}
                unitIds={unitIds}
                unitPairComponent={unitPairComponent}
                sortingSelector={sortingSelector}
            />
            <MarkdownDialog
                visible={subsamplingPopupVisible.visible}
                onClose={subsamplingPopupVisible.hide}
                source={correlogramSubsamplingInfo}
            />
        </Fragment>
    )
}

export default CrossCorrelogramsWidget