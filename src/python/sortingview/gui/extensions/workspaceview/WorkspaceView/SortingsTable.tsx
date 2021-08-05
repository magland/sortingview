import { Button, CircularProgress } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import NiceTable from 'figurl/labbox-react/components/NiceTable/NiceTable';
import { Recording, Sorting, WorkspaceRouteDispatch } from "../../../pluginInterface";
import { useSortingInfos } from 'python/sortingview/gui/pluginInterface/useSortingInfo';

interface Props {
    recording: Recording
    sortings: Sorting[]
    workspaceRouteDispatch: WorkspaceRouteDispatch
    onDeleteSortings?: ((sortingIds: string[]) => void)
}

const SortingsTable: FunctionComponent<Props> = ({ recording, sortings, onDeleteSortings, workspaceRouteDispatch }) => {

    const [selectedSortingIds, setSelectedSortingIds] = useState<string[]>([])

    const handleViewSorting = useCallback((sorting: Sorting) => {
        workspaceRouteDispatch({
            type: 'gotoSortingPage',
            recordingId: sorting.recordingId,
            sortingId: sorting.sortingId
        })
    }, [workspaceRouteDispatch])

    const sortingInfos = useSortingInfos(sortings)

    const sortings2: Sorting[] = useMemo(() => (sortByKey<Sorting>(sortings, 'sortingLabel')), [sortings])
    const rows = useMemo(() => (sortings2.map(s => {
        const sortingInfo = sortingInfos[s.sortingId]
        return {
            key: s.sortingId,
            columnValues: {
                sorting: s,
                sortingLabel: {
                    text: s.sortingLabel,
                    element: <ViewSortingLink sorting={s} onClick={handleViewSorting} />
                },
                numUnits: sortingInfo ? sortingInfo.unit_ids.length : {element: <CircularProgress />}
            }
        }
    })), [sortings2, handleViewSorting, sortingInfos])

    const handleDeleteRow = useCallback((key: string) => {
        onDeleteSortings && onDeleteSortings([key])
    }, [onDeleteSortings])

    const columns = [
        {
            key: 'sortingLabel',
            label: 'Sorting'
        },
        {
            key: 'numUnits',
            label: 'Num. units'
        }
    ]

    const compareEnabled = (selectedSortingIds.length === 2)
    const handleCompareSortings = useCallback(() => {
        if (selectedSortingIds.length !== 2) throw Error('Unexpected')
        const sortingId1 = selectedSortingIds[0]
        const sortingId2 = selectedSortingIds[1]
        workspaceRouteDispatch({type: 'gotoSortingComparisonPage', sortingId1, sortingId2, recordingId: recording.recordingId})
    }, [workspaceRouteDispatch, selectedSortingIds, recording])

    return (
        <div>
            {
                sortings2.length > 1 ? (
                    <Button disabled={!compareEnabled} onClick={handleCompareSortings}>Compare selected sortings</Button>
                ) : <span />
            }
            <NiceTable
                rows={rows}
                columns={columns}
                deleteRowLabel={"Remove this sorting"}
                onDeleteRow={onDeleteSortings ? handleDeleteRow : undefined}
                selectionMode="multiple"
                selectedRowKeys={selectedSortingIds}
                onSelectedRowKeysChanged={setSelectedSortingIds}
            />
        </div>
    );
}

const ViewSortingLink: FunctionComponent<{sorting: Sorting, onClick: (s: Sorting) => void}> = ({sorting, onClick}) => {
    const handleClick = useCallback(() => {
        onClick(sorting)
    }, [sorting, onClick])
    return (
        <Anchor title="View recording" onClick={handleClick}>{sorting.sortingLabel}</Anchor>
    )
}

const Anchor: FunctionComponent<{title: string, onClick: () => void}> = ({title, children, onClick}) => {
    return (
        <button type="button" className="link-button" onClick={onClick}>{children}</button>
    )
}

const sortByKey = <T extends {[key: string]: any}>(array: T[], key: string): T[] => {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}



export default SortingsTable