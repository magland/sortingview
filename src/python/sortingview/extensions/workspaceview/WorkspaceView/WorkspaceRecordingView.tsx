import { Button, Grid } from '@material-ui/core';
import { createCalculationPool, usePlugins } from 'labbox';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import Expandable from '../../common/Expandable';
import Hyperlink from '../../common/Hyperlink';
import Splitter from '../../common/Splitter';
import { useRecordingInfo } from '../../common/useRecordingInfo';
import { LabboxPlugin, Recording, RecordingSelection, recordingSelectionReducer, recordingViewPlugins, Sorting, WorkspaceRoute, WorkspaceRouteDispatch } from "../../pluginInterface";
import sortByPriority from '../../sortByPriority';
import RecordingInfoView from './RecordingInfoView';
import SortingInstructions from './SortingInstructions';
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

const calculationPool = createCalculationPool({ maxSimultaneous: 6 })

const WorkspaceRecordingView: FunctionComponent<Props> = ({ recording, sortings, workspaceRoute, workspaceRouteDispatch, onDeleteSortings, width, height }) => {
  const recordingInfo = useRecordingInfo(recording.recordingPath)
  const [showSpikeSortingInstructions, setShowSpikeSortingInstructions] = useState(false)

  const handleSpikeSorting = () => {
    setShowSpikeSortingInstructions(true)
  }

  const initialRecordingSelection: RecordingSelection = {}
  const [selection, selectionDispatch] = useReducer(recordingSelectionReducer, initialRecordingSelection)

  useEffect(() => {
    if ((!selection.timeRange) && (recordingInfo)) {
      selectionDispatch({ type: 'SetTimeRange', timeRange: { min: 0, max: Math.min(recordingInfo.num_frames, recordingInfo.sampling_frequency / 10) } })
    }
  }, [selection, recordingInfo])

  const handleBackToRecordings = useCallback(() => {
    workspaceRouteDispatch({
      type: 'gotoRecordingsPage'
    })
  }, [workspaceRouteDispatch])

  const handleExploreRecording = useCallback(() => {
      workspaceRouteDispatch({
        type: 'gotoSortingPage',
        recordingId: recording.recordingId,
        sortingId: '-'
      })
  }, [workspaceRouteDispatch, recording.recordingId])

  const plugins = usePlugins<LabboxPlugin>()
  const rvPlugins = useMemo(() => (recordingViewPlugins(plugins)), [plugins])

  if (!recordingInfo) return <div>Loading recording info</div>

  const content = (
    <div style={{ margin: 20 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} xl={6}>
          <Button onClick={handleBackToRecordings}>Back to recordings</Button>
          <h2>{recording.recordingLabel}</h2>
          <div>{recording.recordingPath}</div>
          <RecordingInfoView recordingInfo={recordingInfo} hideElectrodeGeometry={true} />
        </Grid>

        <Grid item xs={12} xl={6}>
          <Hyperlink onClick={handleExploreRecording}>Explore recording</Hyperlink>
        </Grid>
        <Grid item xs={12} xl={6}>
          <SortingsView
            sortings={sortings}
            workspaceRouteDispatch={workspaceRouteDispatch}
            workspaceRoute={workspaceRoute}
            onDeleteSortings={onDeleteSortings}
          />
        </Grid>
      </Grid>
      {/* {
          sortByPriority(rvPlugins).filter(rv => (!rv.disabled)).map(rv => (
          <Expandable label={rv.label} defaultExpanded={rv.defaultExpanded ? true : false} key={'rv-' + rv.name}>
            <rv.component
              key={'rvc-' + rv.name}
              calculationPool={calculationPool}
              recording={recording}
              recordingInfo={recordingInfo}
              selection={selection}
              selectionDispatch={selectionDispatch}
              width={width - 40}
            />
          </Expandable>
        ))
      } */}
    </div>
  )

  return (
    <Splitter
      {...{ width, height }}
      initialPosition={300}
      positionFromRight={true}
    >
      <div>
        {
          !showSpikeSortingInstructions && (
            <div><Button onClick={handleSpikeSorting}>Spike sorting</Button></div>
          )
        }
        {content}
      </div>
      {
        showSpikeSortingInstructions && (
          <SortingInstructions
            workspaceRoute={workspaceRoute}
            recordingId={recording.recordingId}
            recordingLabel={recording.recordingLabel}
          />
        )
      }
    </Splitter>
  )
}

export default WorkspaceRecordingView