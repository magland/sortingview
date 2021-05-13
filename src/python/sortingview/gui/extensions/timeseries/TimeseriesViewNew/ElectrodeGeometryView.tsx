import React, { FunctionComponent, useMemo } from 'react';
import { RecordingInfo, RecordingSelection, RecordingSelectionDispatch } from '../../../pluginInterface';
import ElectrodeGeometryWidget from "../../electrodegeometry/ElectrodeGeometryWidget/ElectrodeGeometryWidget";


interface Props {
    recordingInfo: RecordingInfo
    width: number
    height: number
    selection: RecordingSelection
    selectionDispatch: RecordingSelectionDispatch
    visibleElectrodeIds: number[]
}

const ElectrodeGeometryView: FunctionComponent<Props> = ({recordingInfo, width, height, selection, visibleElectrodeIds, selectionDispatch}) => {
    const ri = recordingInfo
    const electrodes = useMemo(() => (ri ? zipElectrodes(ri.geom, ri.channel_ids) : []).filter(a => (visibleElectrodeIds.includes(a.id))), [ri, visibleElectrodeIds])
    if (!ri) {
        return (
            <div>No recording info found for recording.</div>
        )
    }
    return (
        <ElectrodeGeometryWidget
            electrodes={electrodes}
            selection={selection}
            selectionDispatch={selectionDispatch}
            width={width}
            height={height}
        />
    );
}

const zipElectrodes = (locations: number[][], ids: number[]) => {
    if (locations && ids && ids.length !== locations.length) throw Error('Electrode ID count does not match location count.')
    return ids.map((x, index) => {
        const loc = locations[index]
        return { label: x + '', id: x, x: loc[0], y: loc[1] }
    })
}

export default ElectrodeGeometryView