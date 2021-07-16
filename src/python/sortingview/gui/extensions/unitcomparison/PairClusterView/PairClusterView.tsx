import { useChannel, usePureCalculationTask } from 'kachery-react';
import TaskStatusView from 'kachery-react/components/TaskMonitor/TaskStatusView';
import { applyMergesToUnit, Recording, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from 'python/sortingview/gui/pluginInterface';
import React, { FunctionComponent } from 'react';
import { useMemo } from 'react';
import PairClusterWidget from './PairClusterWidget';

type Props = {
    recording: Recording
    sorting: Sorting
    selection: SortingSelection
    curation: SortingCuration
    selectionDispatch: SortingSelectionDispatch
    unitIds: number[]
    snippetLen?: [number, number]
    width: number
    height: number
}

type Result = {
    timepoints: number[]
    labels: number[]
    x: number[]
    y: number[]
}


const PairClusterView: FunctionComponent<Props> = ({recording, sorting, unitIds, selection, curation, snippetLen, width, height}) => {
    const {channelName} = useChannel()
    const unitIdsX = useMemo(() => (unitIds.map(unitId => (applyMergesToUnit(unitId, curation, selection.applyMerges)))), [unitIds, curation, selection])
    const unitId1 = unitIdsX[0]
    const unitId2 = unitIdsX[1]
    const {returnValue: features, task} = usePureCalculationTask<Result>(
        'pair_cluster_features.4',
        {
            recording_object: recording.recordingObject,
            sorting_object: sorting.sortingObject,
            unit_id1: unitId1,
            unit_id2: unitId2,
            snippet_len: snippetLen
        },
        {
            channelName
        }
    )
    if (!features) {
        return <TaskStatusView
            {...{task, label: 'cluster features'}}
        />
    }
    return (
        <PairClusterWidget
            x={features.x}
            y={features.y}
            labels={features.labels}
            {...{width, height}}
        />
    )
}

export default PairClusterView