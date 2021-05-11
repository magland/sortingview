// convert to tsx
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
// import { Electrode } from '../../devel/ElectrodeGeometryTest/ElectrodeGeometry';
// import ElectrodeGeometryWidget from '../../electrodegeometry/ElectrodeGeometryWidget/ElectrodeGeometryWidget';
import { RecordingInfo } from "../../../pluginInterface";


// const zipElectrodes = (locations: number[][], ids: number[]): Electrode[] => {
//     if (locations && ids && ids.length !== locations.length) throw Error('Electrode ID count does not match location count.')
//     return ids.map((x: number, index: number) => {
//         const loc = locations[index]
//         return { label: x + '', x: loc[0], y: loc[1], id: x }
//     })
// }

const RecordingInfoView: FunctionComponent<{recordingInfo: RecordingInfo, hideElectrodeGeometry: boolean}> = ({ recordingInfo, hideElectrodeGeometry }) => {
    const ri = recordingInfo;
    // const electrodes = useMemo(() => (ri ? zipElectrodes(ri.geom, ri.channel_ids) : []), [ri])
    // const [selection, selectionDispatch] = useReducer(recordingSelectionReducer, {})
    if (!ri) {
        return (
            <div>No recording info found for recording.</div>
        )
    }
    return (
        <React.Fragment>
            <div style={{ width: 600 }}>
                <RecordingViewTable
                    sampling_frequency={ri.sampling_frequency}
                    num_frames={ri.num_frames}
                    channel_ids={ri.channel_ids}
                    channel_groups={ri.channel_groups}
                    noise_level={ri.noise_level}
                />
            </div>
            {/* {
                !hideElectrodeGeometry && (
                    <ElectrodeGeometryWidget
                        electrodes={electrodes}
                        selection={selection}
                        selectionDispatch={selectionDispatch}
                        width={350}
                        height={150}
                    />
                )
            } */}
        </React.Fragment>
    );
}

type RecordingViewTableProps = {
    sampling_frequency: number
    channel_ids: number[]
    channel_groups: number[]
    num_frames: number
    noise_level: number
}

const RecordingViewTable: FunctionComponent<RecordingViewTableProps> = ({ sampling_frequency, channel_ids, channel_groups, num_frames, noise_level }) => {
    return (
        <Table className="NiceTable">
            <TableHead>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>Sampling frequency</TableCell>
                    <TableCell>{sampling_frequency}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Num. frames</TableCell>
                    <TableCell>{num_frames}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Duration (min)</TableCell>
                    <TableCell>{num_frames / sampling_frequency / 60}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Num. channels</TableCell>
                    <TableCell>{channel_ids.length}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Channel IDs</TableCell>
                    <TableCell>{channel_ids.length < 20 ? commasep(channel_ids) : commasep(channel_ids.slice(0, 20)) + ' ...'}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Channel groups</TableCell>
                    <TableCell>{channel_groups.length < 20 ? commasep(channel_groups) : commasep(channel_groups.slice(0, 20)) + ' ...'}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Noise level</TableCell>
                    <TableCell>{noise_level}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}

function commasep(x: number[]) {
    return x.map(a => (a + '')).join(', ');
}

export default RecordingInfoView;