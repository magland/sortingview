import React, { FunctionComponent, useCallback } from 'react';
import { WorkspaceViewProps } from '../../../pluginInterface/WorkspaceViewPlugin';
import SortingView from './SortingView';
import WorkspaceHomeView from './WorkspaceHomeView';
import WorkspaceRecordingView from './WorkspaceRecordingView';

export interface LocationInterface {
  pathname: string
  search: string
}

export interface HistoryInterface {
  location: LocationInterface
  push: (x: LocationInterface) => void
}

const WorkspaceView: FunctionComponent<WorkspaceViewProps> = ({ workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width=500, height=500 }) => {
  const handleDeleteRecordings = useCallback((recordingIds: string[]) => {
    workspaceDispatch && workspaceDispatch({
      type: 'DELETE_RECORDINGS',
      recordingIds
    })
  }, [workspaceDispatch])

  const handleDeleteSortings = useCallback((sortingIds: string[]) => {
    workspaceDispatch && workspaceDispatch({
      type: 'DELETE_SORTINGS',
      sortingIds
    })
  }, [workspaceDispatch])

  switch (workspaceRoute.page) {
    case 'workspace': return (
      <WorkspaceHomeView
        onDeleteRecordings={workspaceDispatch ? handleDeleteRecordings : undefined}
        {...{ width, height, workspace, workspaceRoute, workspaceRouteDispatch }}
      />
    )
    case 'recording': {
      const rid = workspaceRoute.recordingId
      const recording = workspace.recordings.filter(r => (r.recordingId === rid))[0]
      if (!recording) return <div>Recording not found: {rid}</div>
      return (
        <WorkspaceRecordingView
          onDeleteSortings={workspaceDispatch ? handleDeleteSortings : undefined}
          {...{ width, height, recording, workspaceRouteDispatch, workspaceRoute }}
          sortings={workspace.sortings.filter(s => (s.recordingId === rid))}
        />
      )
    }
    case 'sorting': {
      const rid = workspaceRoute.recordingId
      const recording = workspace.recordings.filter(r => (r.recordingId === rid))[0]
      if (!recording) return <div>Recording not found: {rid}</div>
      const sid = workspaceRoute.sortingId
      if (sid !== '-') {
        const sorting = workspace.sortings.filter(s => (s.recordingId === rid && s.sortingId === sid))[0]
        if (!sorting) return <div>Sorting not found: {rid}/{sid}</div>
        return (
          <SortingView
            sorting={sorting}
            recording={recording}
            // onSetExternalUnitMetrics={(a: { sortingId: string, externalUnitMetrics: ExternalSortingUnitMetric[] }) => { }}
            width={width}
            height={height}
            readOnly={workspaceDispatch ? false : true}
            workspaceRoute={workspaceRoute}
            workspaceRouteDispatch={workspaceRouteDispatch}
            snippetLen={workspace.snippetLen}
          />
        )
      }
      else {
        return (
          <SortingView
            sorting={null}
            recording={recording}
            // onSetExternalUnitMetrics={(a: { sortingId: string, externalUnitMetrics: ExternalSortingUnitMetric[] }) => { }}
            width={width}
            height={height}
            readOnly={workspaceDispatch ? false : true}
            workspaceRoute={workspaceRoute}
            workspaceRouteDispatch={workspaceRouteDispatch}
            snippetLen={workspace.snippetLen}
          />
        )
      }
    }
  }
}

export default WorkspaceView