// LABBOX-EXTENSION: timeseries
// LABBOX-EXTENSION-TAGS: jupyter

import TimelineIcon from '@material-ui/icons/Timeline';
import React, { FunctionComponent } from 'react';
import { LabboxExtensionContext, RecordingViewProps, SortingViewProps } from '../../pluginInterface';
import TimeseriesViewNew from './TimeseriesViewNew/TimeseriesViewNew';

const TimeseriesSortingView: FunctionComponent<SortingViewProps> = ({recording, recordingInfo, sorting, width, height, selection, selectionDispatch}) => {
    return (
        <TimeseriesViewNew
            recordingObject={recording.recordingObject}
            recordingInfo={recordingInfo}
            width={width || 600}
            height={height || 600}
            opts={{channelSelectPanel: true}}
            recordingSelection={selection}
            recordingSelectionDispatch={selectionDispatch}

            // for spike markers:
            sortingObject={sorting.sortingObject}
            sortingSelection={selection}
        />
    )
}

const TimeseriesRecordingView: FunctionComponent<RecordingViewProps> = ({recording, recordingInfo, width, height, selection, selectionDispatch}) => {
    return (
        <TimeseriesViewNew
            recordingObject={recording.recordingObject}
            recordingInfo={recordingInfo}
            width={width || 600}
            height={height || 600}
            opts={{channelSelectPanel: true}}
            recordingSelection={selection}
            recordingSelectionDispatch={selectionDispatch}
        />
    )
}

export function activate(context: LabboxExtensionContext) {
    context.registerPlugin({
        type: 'RecordingView',
        name: 'TimeseriesView',
        label: 'Timeseries',
        priority: 50,
        fullWidth: true,
        component: TimeseriesRecordingView
    })
    context.registerPlugin({
        type: 'SortingView',
        name: 'TimeseriesView',
        label: 'Timeseries',
        priority: 50,
        component: TimeseriesSortingView,
        icon: <TimelineIcon />
    })
}