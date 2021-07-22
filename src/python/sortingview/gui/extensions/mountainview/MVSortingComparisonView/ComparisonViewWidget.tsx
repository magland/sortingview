import React, { FunctionComponent } from 'react';
import { Sorting, SortingComparisonViewProps, SortingCuration, SortingCurationDispatch, SortingInfo, SortingSelection, SortingSelectionDispatch, SortingViewPlugin, SortingViewProps } from "../../../pluginInterface";
import { View } from '../MVSortingView/MVSortingView';

type Props = {
    view: View
    sortingComparisonViewProps: SortingComparisonViewProps
    width?: number
    height?: number
}

const ComparisonViewWidget: FunctionComponent<Props> = ({ view, sortingComparisonViewProps, width, height }) => {
    const p = view.plugin as SortingViewPlugin
    const Component = p.component
    let pr: {[key: string]: any} = {}
    if (width) pr.width = width
    if (height) pr.height = height

    let sorting: Sorting
    let sortingInfo: SortingInfo
    let curation: SortingCuration
    let curationDispatch: SortingCurationDispatch | undefined
    let selection: SortingSelection
    let selectionDispatch: SortingSelectionDispatch
    let compareSorting: Sorting
    const sortingSelector = view.extraProps['sortingSelector']
    if (sortingSelector === 'A') {
        sorting = sortingComparisonViewProps.sorting1
        compareSorting = sortingComparisonViewProps.sorting2
        sortingInfo = sortingComparisonViewProps.sortingInfo1
        curation = sortingComparisonViewProps.curation1
        curationDispatch = sortingComparisonViewProps.curation1Dispatch
        selection = sortingComparisonViewProps.selection1
        selectionDispatch = sortingComparisonViewProps.selection1Dispatch
    }
    else if (sortingSelector === 'B') {
        sorting = sortingComparisonViewProps.sorting2
        compareSorting = sortingComparisonViewProps.sorting1
        sortingInfo = sortingComparisonViewProps.sortingInfo2
        curation = sortingComparisonViewProps.curation2
        curationDispatch = sortingComparisonViewProps.curation2Dispatch
        selection = sortingComparisonViewProps.selection2
        selectionDispatch = sortingComparisonViewProps.selection2Dispatch
    }
    else {
        throw Error(`Invalid sorting selector: ${sortingSelector}`)
    }

    const {recording, recordingInfo, readOnly, calculationPool, snippetLen} = sortingComparisonViewProps

    const sortingViewProps: SortingViewProps = {
        sorting,
        compareSorting,
        recording,
        sortingInfo,
        recordingInfo,
        curation,
        curationDispatch,
        selection,
        selectionDispatch,
        readOnly,
        calculationPool,
        snippetLen,
        width: 0,
        height: 0,
        sortingSelector
    }

    return (
        <Component {...sortingViewProps} {...pr} {...view.extraProps} />
    )
}

export default ComparisonViewWidget