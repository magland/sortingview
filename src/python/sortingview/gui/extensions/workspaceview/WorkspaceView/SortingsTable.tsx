import { CircularProgress } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import NiceTable from 'labbox-react/components/NiceTable/NiceTable';
import { Sorting, WorkspaceRouteDispatch } from "../../../pluginInterface";
import { useSortingInfos } from 'python/sortingview/gui/pluginInterface/useSortingInfo';

interface Props {
    sortings: Sorting[]
    workspaceRouteDispatch: WorkspaceRouteDispatch
    onDeleteSortings: ((sortingIds: string[]) => void) | undefined
}

const SortingsTable: FunctionComponent<Props> = ({ sortings, onDeleteSortings, workspaceRouteDispatch }) => {
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

    return (
        <div>
            <NiceTable
                rows={rows}
                columns={columns}
                deleteRowLabel={"Remove this sorting"}
                onDeleteRow={onDeleteSortings ? handleDeleteRow : undefined}
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