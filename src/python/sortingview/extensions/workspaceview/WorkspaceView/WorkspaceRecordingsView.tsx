import { Button } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useState } from 'react';
import Splitter from '../../common/Splitter';
import { Recording, Sorting, WorkspaceRoute, WorkspaceRouteDispatch } from "../../pluginInterface";
import ImportRecordingsInstructions from './ImportRecordingsInstructions';
import RecordingsTable from './RecordingsTable';

type Props = {
    sortings: Sorting[]
    recordings: Recording[]
    workspaceRoute: WorkspaceRoute
    onDeleteRecordings: ((recordingIds: string[]) => void) | undefined
    width: number
    height: number
    workspaceRouteDispatch: WorkspaceRouteDispatch
}

const WorkspaceRecordingsView: FunctionComponent<Props> = ({ width, height, sortings, recordings, onDeleteRecordings, workspaceRoute, workspaceRouteDispatch }) => {
    const [showImportInstructions, setShowImportInstructions] = useState(false)
    const handleImport = useCallback(() => {
        setShowImportInstructions(true)
    }, [])
    return (
        <Splitter
            {...{width, height}}
            initialPosition={300}
            positionFromRight={true}
        >
            <div>
                {
                    !showImportInstructions && (
                        <div><Button onClick={handleImport}>Import recordings</Button></div>
                    )
                }
                <RecordingsTable
                    {...{sortings, recordings, onDeleteRecordings, readOnly: false, workspaceRouteDispatch}}
                />
            </div>
            {
                showImportInstructions && (
                    <ImportRecordingsInstructions
                        workspaceRoute={workspaceRoute}
                    />
                )
            }
        </Splitter>
    )
}

export default WorkspaceRecordingsView