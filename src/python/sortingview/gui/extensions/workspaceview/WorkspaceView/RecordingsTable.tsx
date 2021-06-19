import { CircularProgress } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import NiceTable from 'labbox-react/components/NiceTable/NiceTable';
import { Recording, RecordingInfo, Sorting, SortingInfo, WorkspaceRouteDispatch } from "../../../pluginInterface";
import './WorkspaceView.css';
import { useRecordingInfos } from 'python/sortingview/gui/pluginInterface/useRecordingInfo';

interface Props {
    recordings: Recording[]
    sortings: Sorting[]
    onDeleteRecordings: ((recordingIds: string[]) => void) | undefined
    workspaceRouteDispatch: WorkspaceRouteDispatch
}

const sortingElement = (sorting: Sorting, sortingInfo?: SortingInfo) => {
    return <span key={sorting.sortingId}>{sorting.sortingId} ({sortingInfo ? sortingInfo.unit_ids.length : ''})</span>
}

const sortingsElement = (sortings: Sorting[]) => {
    return (
        <span>
            {
                sortings.map(s => (
                    sortingElement(s)
                ))
            }
        </span>
    )
}

const RecordingsTable: FunctionComponent<Props> = ({ recordings, sortings, onDeleteRecordings, workspaceRouteDispatch }) => {
    const sortingsByRecordingId: {[key: string]: Sorting[]} = useMemo(() => {
        const ret: {[key: string]: Sorting[]} = {}
        recordings.forEach(r => {
            ret[r.recordingId] = sortings.filter(s => (s.recordingId === r.recordingId))
        })
        return ret
    }, [recordings, sortings])

    function sortByKey<T extends {[key: string]: any}>(array: T[], key: string): T[] {
        return array.sort(function (a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    recordings = sortByKey(recordings, 'recordingLabel');

    const handleViewRecording = useCallback((recording: Recording) => {
        workspaceRouteDispatch({
            type: 'gotoRecordingPage',
            recordingId: recording.recordingId
        })
    }, [workspaceRouteDispatch])

    const recordingInfos: {[key: string]: RecordingInfo | null} = useRecordingInfos(recordings)

    const rows = useMemo(() => (recordings.map(rec => {
        const recordingInfo = recordingInfos[rec.recordingId]
        return {
            key: rec.recordingId,
            columnValues: {
                recording: rec,
                recordingLabel: {
                    text: rec.recordingLabel,
                    element: <ViewRecordingLink onClick={handleViewRecording} recording={rec} />,
                },
                numChannels: recordingInfo ? recordingInfo.channel_ids.length : {element: <CircularProgress />},
                samplingFrequency: recordingInfo ? recordingInfo.sampling_frequency : '',
                durationMinutes: recordingInfo ? recordingInfo.num_frames / recordingInfo.sampling_frequency / 60 : '',
                sortings: { element: sortingsElement(sortingsByRecordingId[rec.recordingId]) }
            }
        }
    })), [recordings, sortingsByRecordingId, handleViewRecording, recordingInfos])

    const handleDeleteRow = useCallback((key: string) => {
        onDeleteRecordings && onDeleteRecordings([key])
    }, [onDeleteRecordings])

    const columns = [
        {
            key: 'recordingLabel',
            label: 'Recording'
        },
        {
            key: 'numChannels',
            label: 'Num. channels'
        },
        {
            key: 'samplingFrequency',
            label: 'Samp. freq. (Hz)'
        },
        {
            key: 'durationMinutes',
            label: 'Duration (min)'
        },
        {
            key: 'sortings',
            label: 'Sortings'
        }
    ]

    return (
        <div>
            <NiceTable
                rows={rows}
                columns={columns}
                deleteRowLabel={"Remove this recording"}
                onDeleteRow={onDeleteRecordings ? handleDeleteRow : undefined}
            />
        </div>
    );
}

const ViewRecordingLink: FunctionComponent<{recording: Recording, onClick: (r: Recording) => void}> = ({recording, onClick}) => {
    const handleClick = useCallback(() => {
        onClick(recording)
    }, [recording, onClick])
    return (
        <Anchor title="View recording" onClick={handleClick}>{recording.recordingLabel}</Anchor>
    )
}

const Anchor: FunctionComponent<{title: string, onClick: () => void}> = ({title, children, onClick}) => {
    return (
        <button type="button" className="link-button" onClick={onClick}>{children}</button>
    )
}

export default RecordingsTable