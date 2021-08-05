import { IconButton } from '@material-ui/core';
import { Help } from '@material-ui/icons';
import { useVisible } from 'figurl/labbox-react';
import MarkdownDialog from 'figurl/labbox-react/components/Markdown/MarkdownDialog';
import React, { Fragment, useMemo } from 'react';
import SortingUnitPlotGrid from '../../commonComponents/SortingUnitPlotGrid/SortingUnitPlotGrid';
import { SortingViewProps } from "../../pluginInterface";
import correlogramSubsamplingInfo from '../../helpPages/CorrelogramSubsamplingInfo.md.gen';
import CorrelogramRv2 from './Correlogram_ReactVis2';

// const autocorrelogramsCalculationPool = createCalculationPool({maxSimultaneous: 6});

const AutoCorrelograms: React.FunctionComponent<SortingViewProps> = ({ sorting, selection, curation, selectionDispatch, sortingSelector }) => {
    const unitComponent = useMemo(() => (unitId: number) => (
        <CorrelogramRv2
            {...{sorting, unitId1: unitId, selection, curation, selectionDispatch}}
            width={240}
            height={180}
        />
    ), [sorting, selection, selectionDispatch, curation])

    const subsamplingPopupVisible = useVisible()

    return (
        <Fragment>
            <div>
                <IconButton onClick={subsamplingPopupVisible.show}><Help /></IconButton>
            </div>
            <SortingUnitPlotGrid
                sorting={sorting}
                selection={selection}
                curation={curation}
                selectionDispatch={selectionDispatch}
                unitComponent={unitComponent}
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

export default AutoCorrelograms