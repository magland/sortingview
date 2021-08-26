// LABBOX-EXTENSION: electrodegeometry
// LABBOX-EXTENSION-TAGS: jupyter

import GrainIcon from '@material-ui/icons/Grain';
import React, { FunctionComponent, useMemo } from 'react';
import { LabboxExtensionContext, RecordingViewProps, SortingViewProps } from '../../pluginInterface';
import { useRecordingInfo } from '../../pluginInterface/useRecordingInfo';
import ElectrodeGeometryWidget from './ElectrodeGeometryWidget/ElectrodeGeometryWidget';

const zipElectrodes = (locations: number[][], ids: number[]) => {
    if (locations && ids && ids.length !== locations.length) throw Error('Electrode ID count does not match location count.')
    return ids.map((x, index) => {
        const loc = locations[index]
        return { label: x + '', id: x, x: loc[0], y: loc[1] }
    })
}

const ElectrodeGeometryRecordingView: FunctionComponent<RecordingViewProps> = ({recording, width, height, selection, selectionDispatch}) => {
    const ri = useRecordingInfo(recording.recordingPath)
    const visibleElectrodeIds = selection.visibleElectrodeIds
    const electrodes = useMemo(() => (ri ? zipElectrodes(ri.geom, ri.channel_ids) : []).filter(a => ((!visibleElectrodeIds) || (visibleElectrodeIds.includes(a.id)))), [ri, visibleElectrodeIds])

    if (!ri) {
        return (
            <div>No recording info found for recording.</div>
        )
    }
    return (
        <ElectrodeGeometryWidget
            electrodes={electrodes}
            selectedElectrodeIds={selection.selectedElectrodeIds || []}
            selectionDispatch={selectionDispatch}
            width={width || 350}
            height={height || 150}
        />
    );
}

const ElectrodeGeometrySortingView: FunctionComponent<SortingViewProps> = ({recording, recordingInfo, calculationPool, width, height, selection, selectionDispatch}) => {
    return (
        <ElectrodeGeometryRecordingView
            {...{recording, recordingInfo, calculationPool, width, height, selection, selectionDispatch}}
        />
    )
}

export function activate(context: LabboxExtensionContext) {
    context.registerPlugin({
        type: 'RecordingView',
        name: 'ElectrodeGeometryRecordingView',
        label: 'Electrode geometry',
        priority: 50,
        defaultExpanded: false,
        component: ElectrodeGeometryRecordingView,
        singleton: true,
        icon: <GrainIcon />
    })
    context.registerPlugin({
        type: 'SortingView',
        name: 'ElectrodeGeometrySortingView',
        label: 'Electrode geometry',
        priority: 50,
        component: ElectrodeGeometrySortingView,
        singleton: true,
        icon: <GrainIcon />
    })
}