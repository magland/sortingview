import { Paper } from "@material-ui/core";
import React, { FunctionComponent } from 'react';
import { Recording, Sorting, WorkspaceRoute, WorkspaceRouteDispatch } from "../../../pluginInterface";
import SortingsTable from './SortingsTable';

type Props = {
    recording: Recording
    sortings: Sorting[]
    workspaceRouteDispatch: WorkspaceRouteDispatch
    workspaceRoute: WorkspaceRoute
    onDeleteSortings: ((sortingIds: string[]) => void) | undefined
}

const SortingsView: FunctionComponent<Props> = ({ recording, sortings, workspaceRouteDispatch, workspaceRoute, onDeleteSortings }) => {
    return (
        <Paper>
            <h3>{`${sortings.length} sorting${sortings.length !== 1 ? "s" : ""}`}</h3>
            <SortingsTable
                recording={recording}
                sortings={sortings}
                workspaceRouteDispatch={workspaceRouteDispatch}
                onDeleteSortings={onDeleteSortings}
            />
        </Paper>
    );
}

export default SortingsView;