import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import React, { FunctionComponent, useMemo } from 'react';
import CopyableText from './CopyableText';
import { SummaryViewData } from './SummaryViewData';

type Props = {
    data: SummaryViewData
    width: number
    height: number
}

const SummaryView: FunctionComponent<Props> = ({data, width, height}) => {
    const divStyle: React.CSSProperties = useMemo(() => ({
        width: width - 20, // leave room for the scrollbar
        height,
        position: 'relative',
        overflowY: 'auto'
    }), [width, height])

    return (
        <div style={divStyle}>
            <Table className="NiceTable">
                <TableBody>
                    <TableRow>
                        <TableCell>Recording description</TableCell>
                        <TableCell>{data.recordingDescription}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Sorting description</TableCell>
                        <TableCell>{data.sortingDescription}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Channel IDs</TableCell>
                        <TableCell>{data.channelIds.join(', ')}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Unit IDs</TableCell>
                        <TableCell>{data.unitIds.join(', ')}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Noise level</TableCell>
                        <TableCell>{data.noiseLevel}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Sampling frequency</TableCell>
                        <TableCell>{data.samplingFrequency}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Num. samples</TableCell>
                        <TableCell>{data.numFrames}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Duration (minutes)</TableCell>
                        <TableCell>{data.numFrames / data.samplingFrequency / 60}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Num. segments (internal)</TableCell>
                        <TableCell>{data.numSegments}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Recording object</TableCell>
                        <TableCell><CopyableText text={JSON.stringify(data.recordingObject)} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Sorting object</TableCell>
                        <TableCell><CopyableText text={JSON.stringify(data.sortingObject)} /></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}

export default SummaryView