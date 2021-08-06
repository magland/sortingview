import { FigurlPlugin } from "figurl/types";
import { isArrayOf, isNumber, isString, optional, _validateObject } from "kachery-js/types/kacheryTypes";
import AverageWaveformsView from "python/sortingview/gui/extensions/averagewaveforms/AverageWaveformsView/AverageWaveformsView";
import { Recording, Sorting, SortingInfo, SortingSelection, sortingSelectionReducer } from "python/sortingview/gui/pluginInterface";
import { useRecordingInfo } from "python/sortingview/gui/pluginInterface/useRecordingInfo";
import { useSortingInfo } from "python/sortingview/gui/pluginInterface/useSortingInfo";
import { useSortingViewWorkspace } from 'python/sortingview/gui/WorkspacePage/WorkspacePage';
import React, { FunctionComponent, useMemo, useReducer } from 'react';

type AverageWaveformsData = {
    workspaceUri: string,
    recordingId: string,
    sortingId: string,
    unitIds?: number[]
}
const isAverageWaveformsData = (x: any): x is AverageWaveformsData => {
    return _validateObject(x, {
        workspaceUri: isString,
        recordingId: isString,
        sortingId: isString,
        unitIds: optional(isArrayOf(isNumber))
    })
}

type Props = {
    data: AverageWaveformsData
    width: number
    height: number
}

const emptySorting: Sorting = {
    sortingId: '',
    sortingLabel: '',
    sortingPath: '',
    sortingObject: null,
    recordingId: '',
    recordingPath: '',
    recordingObject: null
}

const emptySortingInfo: SortingInfo = {
    unit_ids: [],
    samplerate: 0,
    sorting_object: {}
}

const AverageWaveformsComponent: FunctionComponent<Props> = ({ data, width, height }) => {
    const { workspaceUri, recordingId, sortingId, unitIds } = data

    const { workspace } = useSortingViewWorkspace(workspaceUri)

    const initialSortingSelection: SortingSelection = {}
    const [selection, selectionDispatch] = useReducer(sortingSelectionReducer, initialSortingSelection)

    const sorting: Sorting | undefined = workspace.sortings.filter(s => (s.recordingId === recordingId && s.sortingId === sortingId))[0]
    const recording: Recording | undefined = workspace.recordings.filter(r => (r.recordingId === recordingId))[0]

    const sortingInfo = useSortingInfo(sorting ? sorting.sortingPath : undefined)
    const recordingInfo = useRecordingInfo(recording?.recordingPath)

    const snippetLen: [number, number] = useMemo(() => (
        [50, 80]
    ), [])

    const selection2 = useMemo(() => {
        if (unitIds) {
            return {...selection, visibleUnitIds: unitIds}
        }
        else return selection
    }, [selection, unitIds])

    if ((!recording) && (sorting)) {
        return <h3>{`Recording not found: ${sorting.recordingId}`}</h3>
    }
    if (!recordingInfo) {
        return <h3>Loading recording info...</h3>
    }
    if ((!sortingInfo) && (sorting)) {
        return <h3>Loading sorting info...</h3>
    }

    return (
        <AverageWaveformsView
            sorting={sorting || emptySorting}
            recording={recording}
            sortingInfo={sortingInfo || emptySortingInfo}
            recordingInfo={recordingInfo}
            selection={selection2}
            selectionDispatch={selectionDispatch}
            curation={undefined}
            curationDispatch={undefined}
            readOnly={true}
            width={width}
            height={height}
            snippetLen={snippetLen}
        />
    )
}

const getLabel = (x: AverageWaveformsData) => {
    return `Average waveforms: ${x.workspaceUri.slice(0, 20)}.../${x.recordingId}/${x.sortingId} ${(x.unitIds || []).join(', ')}`
}

const AverageWaveformsPlugin: FigurlPlugin = {
    type: 'sortingview.average-waveforms.1',
    validateData: isAverageWaveformsData,
    component: AverageWaveformsComponent,
    getLabel
}

export default AverageWaveformsPlugin