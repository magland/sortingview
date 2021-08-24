import { IconButton } from '@material-ui/core'
import { Help } from '@material-ui/icons'
import { useVisible } from 'labbox-react'
import MarkdownDialog from 'labbox-react/components/Markdown/MarkdownDialog'
import React, { Fragment, useMemo } from 'react'
import SortingUnitPlotGrid from '../../commonComponents/SortingUnitPlotGrid/SortingUnitPlotGrid'
import correlogramSubsamplingInfo from '../../helpPages/CorrelogramSubsamplingInfo.md.gen'
import { SortingViewProps } from "../../pluginInterface"
import useCheckForChanges from '../common/useCheckForChanges'
import CorrelogramRv2 from './Correlogram_ReactVis2'

// const autocorrelogramsCalculationPool = createCalculationPool({maxSimultaneous: 6});

const correlogramWidth = 240
const correlogramHeight = 180

const AutoCorrelograms: React.FunctionComponent<SortingViewProps> = (props) => {
    const { sorting, selection, curation, selectionDispatch, sortingSelector } = props
    useCheckForChanges('AutoCorrelograms', props)

    const applyMerges = useMemo(() => (selection.applyMerges ?? false), [selection.applyMerges])

    const unitComponent = useMemo(() => (unitId: number) => {
        // console.log(`Correlogram built at ${Date.now()}`)
        return (
        <CorrelogramRv2
            {...{sorting, unitId1: unitId, curation, selectionDispatch}}
            applyMerges={applyMerges}
            width={correlogramWidth}
            height={correlogramHeight}
        />
    )}, [sorting, applyMerges, selectionDispatch, curation])

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