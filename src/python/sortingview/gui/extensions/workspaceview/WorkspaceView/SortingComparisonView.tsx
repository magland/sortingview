import { JSONObject, sha1OfObject, SubfeedHash } from 'kachery-js/types/kacheryTypes';
import { initiateTask, useChannel, useKacheryNode } from 'kachery-react';
import useSubfeedReducer from 'kachery-react/useSubfeedReducer';
import { parseWorkspaceUri, usePlugins } from 'labbox-react';
import Hyperlink from 'labbox-react/components/Hyperlink/Hyperlink';
import { SortingCurationAction } from 'python/sortingview/gui/pluginInterface/SortingCuration';
import { useRecordingInfo } from 'python/sortingview/gui/pluginInterface/useRecordingInfo';
import { useSortingInfo } from 'python/sortingview/gui/pluginInterface/useSortingInfo';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { LabboxPlugin, Recording, Sorting, sortingComparisonViewPlugins, SortingSelection, sortingSelectionReducer, WorkspaceRoute, WorkspaceRouteDispatch } from '../../../pluginInterface';
import { sortingCurationReducer } from '../../../pluginInterface/workspaceReducer';

interface Props {
  sorting1: Sorting
  sorting2: Sorting
  recording: Recording
  width: number,
  height: number,
  workspaceRoute: WorkspaceRoute
  workspaceRouteDispatch: WorkspaceRouteDispatch
  readOnly: boolean
  snippetLen?: [number, number]
}

const SortingComparisonView: React.FunctionComponent<Props> = (props) => {
  const { workspaceRoute, readOnly, sorting1, sorting2, recording, workspaceRouteDispatch, snippetLen } = props
  const initialSortingSelection: SortingSelection = {}
  const [selection1, selection1Dispatch] = useReducer(sortingSelectionReducer, initialSortingSelection)
  const [selection2, selection2Dispatch] = useReducer(sortingSelectionReducer, initialSortingSelection)
  
  const sortingInfo1 = useSortingInfo(sorting1.sortingPath)
  const sortingInfo2 = useSortingInfo(sorting2.sortingPath)
  const recordingInfo = useRecordingInfo(recording.recordingPath)
  const sortingId1 = sorting1.sortingId
  const sortingId2 = sorting2.sortingId

  useEffect(() => {
    const numTimepoints = recordingInfo?.num_frames
    if (numTimepoints) {
      selection1Dispatch({
        type: 'SetNumTimepoints',
        numTimepoints
      })
    }
  }, [recordingInfo?.num_frames])

  const {feedId} = parseWorkspaceUri(workspaceRoute.workspaceUri)

  const kacheryNode = useKacheryNode()
  const {channelName} = useChannel()

  // curation1
  const curationSubfeedName1 = useMemo(() => ({name: 'sortingCuration', sortingId1}), [sortingId1])
  const curationSubfeedHash1 = sha1OfObject(curationSubfeedName1 as any as JSONObject) as any as SubfeedHash
  const {state: curation1} = useSubfeedReducer(feedId, curationSubfeedHash1, sortingCurationReducer, {}, {actionField: false})
  const curation1Dispatch = useCallback((a: SortingCurationAction) => {
    initiateTask({
      kacheryNode,
      channelName,
      functionId: 'sortingview_workspace_sorting_curation_action.1',
      kwargs: {
        workspace_uri: workspaceRoute.workspaceUri,
        sorting_id: sortingId1,
        action: a
      },
      functionType: 'action',
      onStatusChanged: () => {}
    })
  }, [kacheryNode, channelName, workspaceRoute.workspaceUri, sortingId1])

  // curation2
  const curationSubfeedName2 = useMemo(() => ({name: 'sortingCuration', sortingId2}), [sortingId2])
  const curationSubfeedHash2 = sha1OfObject(curationSubfeedName2 as any as JSONObject) as any as SubfeedHash
  const {state: curation2} = useSubfeedReducer(feedId, curationSubfeedHash2, sortingCurationReducer, {}, {actionField: false})
  const curation2Dispatch = useCallback((a: SortingCurationAction) => {
    initiateTask({
      kacheryNode,
      channelName,
      functionId: 'sortingview_workspace_sorting_curation_action.1',
      kwargs: {
        workspace_uri: workspaceRoute.workspaceUri,
        sorting_id: sortingId2,
        action: a
      },
      functionType: 'action',
      onStatusChanged: () => {}
    })
  }, [kacheryNode, channelName, workspaceRoute.workspaceUri, sortingId2])

  useEffect(() => {
    if ((!selection1.timeRange) && (recordingInfo)) {
      selection1Dispatch({type: 'SetTimeRange', timeRange: {min: 0, max: Math.min(recordingInfo.num_frames, recordingInfo.sampling_frequency / 10)}})
    }
  }, [selection1, recordingInfo])

  const W = props.width || 800
  const H = props.height || 800

  const footerHeight = 20

  const footerStyle = useMemo<React.CSSProperties>(() => ({
    left: 0,
    top: H - footerHeight,
    width: W,
    height: footerHeight,
    overflow: 'hidden'
  }), [W, H, footerHeight])

  const contentWidth = W
  const contentHeight = H - footerHeight
  const contentWrapperStyle = useMemo<React.CSSProperties>(() => ({
    left: 0,
    top: 0,
    width: contentWidth,
    height: contentHeight
  }), [contentWidth, contentHeight])

  const plugins = usePlugins<LabboxPlugin>()
  const svc = sortingComparisonViewPlugins(plugins).filter(p => (p.name === 'MVSortingComparisonView'))[0]
  if (!svc) throw Error('Missing sorting comparison view: MVSortingComparisonView')
  const svcProps = useMemo(() => (svc.props || {}), [svc.props])

  const handleGotoRecording = useCallback(() => {
      workspaceRouteDispatch({
        type: 'gotoRecordingPage',
        recordingId: recording.recordingId
      })
  }, [workspaceRouteDispatch, recording.recordingId])

  if (!recordingInfo) {
    return <h3>Loading recording info...</h3>
  }
  if (!sortingInfo1) {
    return <h3>Loading sorting1 info...</h3>
  }
  if (!sortingInfo2) {
    return <h3>Loading sorting2 info...</h3>
  }
  
  return (
    <div className="SortingComparisonView">
      <div style={contentWrapperStyle}>
          <svc.component
            {...svcProps}
            sorting1={sorting1}
            sorting2={sorting2}
            recording={recording}
            sortingInfo1={sortingInfo1}
            sortingInfo2={sortingInfo2}
            recordingInfo={recordingInfo}
            selection1={selection1}
            selection2={selection2}
            selection1Dispatch={selection1Dispatch}
            selection2Dispatch={selection2Dispatch}
            curation1={curation1}
            curation2={curation2}
            curation1Dispatch={readOnly ? undefined : curation1Dispatch}
            curation2Dispatch={readOnly ? undefined : curation2Dispatch}
            readOnly={readOnly}
            width={contentWidth}
            height={contentHeight}
            snippetLen={snippetLen}
          />
      </div>
      <div style={footerStyle}>
        <span>
          {`Sorting1: `}
          {sorting1.sortingLabel}
          {` | Sorting2: `}
          {sorting2.sortingLabel}
          {` | Recording: `}
          {<Hyperlink onClick={handleGotoRecording}>{recording.recordingLabel}</Hyperlink>}
        </span>
      </div>
    </div>
  );
}

export default SortingComparisonView