import { CircularProgress } from '@material-ui/core';
import Hyperlink from 'labbox-react/components/Hyperlink/Hyperlink';
import NiceTable from 'labbox-react/components/NiceTable/NiceTable';
import { useRecordingInfos } from 'python/sortingview/gui/pluginInterface/useRecordingInfo';
import { useSortingInfos } from 'python/sortingview/gui/pluginInterface/useSortingInfo';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { Recording, RecordingInfo, Sorting, SortingInfo, WorkspaceRouteDispatch } from "../../../pluginInterface";
import './WorkspaceView.css';

interface Props {
    recordings: Recording[]
    sortings: Sorting[]
    onDeleteRecordings: ((recordingIds: string[]) => void) | undefined
    workspaceRouteDispatch: WorkspaceRouteDispatch
}

const SortingElement: FunctionComponent<{sorting: Sorting, sortingInfo?: SortingInfo, onClickSorting: (sorting: Sorting) => void}> = ({sorting, sortingInfo, onClickSorting}) => {
    const handleClick = useCallback(() => {
        onClickSorting(sorting)
    }, [onClickSorting, sorting])
    return (
        <p>
            <Hyperlink onClick={handleClick} key={sorting.sortingId}>
                {sorting.sortingLabel} ({sortingInfo ? `${sortingInfo.unit_ids.length} units` : ''})
            </Hyperlink>
        </p>
    )
}

const SortingsElement: FunctionComponent<{sortings: Sorting[], onClickSorting: (sorting: Sorting) => void}> = ({sortings, onClickSorting}) => {
    const sortingInfos = useSortingInfos(sortings)
    return (
        <span>
            {
                sortings.map(s => (
                    <SortingElement onClickSorting={onClickSorting} sorting={s} sortingInfo={sortingInfos[s.sortingId] || undefined} />
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

    const handleClickSorting = useCallback((sorting: Sorting) => {
        workspaceRouteDispatch({
            type: 'gotoSortingPage',
            recordingId: sorting.recordingId,
            sortingId: sorting.sortingId
        })
    }, [workspaceRouteDispatch])

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
                sortings: { element: <SortingsElement onClickSorting={handleClickSorting} sortings={sortingsByRecordingId[rec.recordingId]} /> }
            }
        }
    })), [recordings, sortingsByRecordingId, handleViewRecording, recordingInfos, handleClickSorting])

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