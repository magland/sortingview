import { Grid } from '@material-ui/core';
import Hyperlink from 'labbox-react/components/Hyperlink/Hyperlink';
import { useRecordingInfo } from 'python/sortingview/gui/pluginInterface/useRecordingInfo';
import React, { FunctionComponent, useCallback, useEffect, useReducer } from 'react';
import { Recording, RecordingSelection, recordingSelectionReducer, Sorting, WorkspaceRoute, WorkspaceRouteDispatch } from "../../../pluginInterface";
import RecordingInfoView from './RecordingInfoView';
import SortingsView from './SortingsView';

interface Props {
  recording: Recording
  sortings: Sorting[]
  workspaceRoute: WorkspaceRoute
  width: number
  height: number
  workspaceRouteDispatch: WorkspaceRouteDispatch
  onDeleteSortings: ((sortingIds: string[]) => void) | undefined
}


const WorkspaceRecordingView: FunctionComponent<Props> = ({ recording, sortings, workspaceRoute, workspaceRouteDispatch, onDeleteSortings, width, height }) => {
  const recordingInfo = useRecordingInfo(recording.recordingPath)
  const initialRecordingSelection: RecordingSelection = {}
  const [selection, selectionDispatch] = useReducer(recordingSelectionReducer, initialRecordingSelection)

  useEffect(() => {
    const numTimepoints = recordingInfo?.num_frames
    if (numTimepoints) {
      selectionDispatch({
        type: 'SetNumTimepoints',
        numTimepoints
      })
    }
  }, [recordingInfo?.num_frames])

  useEffect(() => {
    if ((!selection.timeRange) && (recordingInfo)) {
      selectionDispatch({ type: 'SetTimeRange', timeRange: { min: 0, max: Math.min(recordingInfo.num_frames, recordingInfo.sampling_frequency / 10) } })
    }
  }, [selection, recordingInfo])

  const handleExploreRecording = useCallback(() => {
      workspaceRouteDispatch({
        type: 'gotoSortingPage',
        recordingId: recording.recordingId,
        sortingId: '-'
      })
  }, [workspaceRouteDispatch, recording.recordingId])

  if (!recordingInfo) return <div>Loading recording info</div>

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} xl={6}>
        <h2>{recording.recordingLabel}</h2>
        <div>{recording.recordingPath}</div>
        <RecordingInfoView recordingInfo={recordingInfo} hideElectrodeGeometry={true} />
      </Grid>

      <Grid item xs={12} xl={6}>
        <Hyperlink onClick={handleExploreRecording}>Explore recording</Hyperlink>
      </Grid>
      <Grid item xs={12} xl={6}>
        <SortingsView
          recording={recording}
          sortings={sortings}
          workspaceRouteDispatch={workspaceRouteDispatch}
          workspaceRoute={workspaceRoute}
          onDeleteSortings={onDeleteSortings}
        />
      </Grid>
    </Grid>
  )
}

export default WorkspaceRecordingView