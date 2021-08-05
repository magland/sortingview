import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { parseWorkspaceUri } from 'figurl/labbox-react';
import { LabboxPlugin, Recording, Sorting, SortingInfo, SortingSelection, sortingSelectionReducer, sortingViewPlugins, WorkspaceRoute, WorkspaceRouteDispatch } from '../../../pluginInterface';
import { sortingCurationReducer } from '../../../pluginInterface/workspaceReducer';
import Hyperlink from 'figurl/labbox-react/components/Hyperlink/Hyperlink'
import { JSONObject, sha1OfObject, SubfeedHash } from 'kachery-js/types/kacheryTypes';
import useSubfeedReducer from 'figurl/kachery-react/useSubfeedReducer'
import { usePlugins } from 'figurl/labbox-react';
import { useSortingInfo } from 'python/sortingview/gui/pluginInterface/useSortingInfo';
import { useRecordingInfo } from 'python/sortingview/gui/pluginInterface/useRecordingInfo';
import { SortingCurationAction } from 'python/sortingview/gui/pluginInterface/SortingCuration';
import { initiateTask, useChannel, useKacheryNode } from 'figurl/kachery-react';

// const intrange = (a: number, b: number) => {
//   const lower = a < b ? a : b;
//   const upper = a < b ? b : a;
//   let arr = [];
//   for (let n = lower; n <= upper; n++) {
//       arr.push(n);
//   }
//   return arr;
// }

interface Props {
  sorting: Sorting | null
  recording: Recording
  width: number,
  height: number,
  workspaceRoute: WorkspaceRoute
  workspaceRouteDispatch: WorkspaceRouteDispatch
  readOnly: boolean
  snippetLen?: [number, number]
  // onSetExternalUnitMetrics: (a: { sortingId: string, externalUnitMetrics: ExternalSortingUnitMetric[] }) => void
}

const SortingView: React.FunctionComponent<Props> = (props) => {
  const { workspaceRoute, readOnly, sorting, recording, workspaceRouteDispatch, snippetLen } = props
  // const [externalUnitMetricsStatus, setExternalUnitMetricsStatus] = useState<CalcStatus>('waiting');
  //const initialSortingSelection: SortingSelection = {currentTimepoint: 1000, animation: {currentTimepointVelocity: 100, lastUpdateTimestamp: Number(new Date())}}
  const initialSortingSelection: SortingSelection = {}
  const [selection, selectionDispatch] = useReducer(sortingSelectionReducer, initialSortingSelection)
  
  const sortingInfo = useSortingInfo(sorting ? sorting.sortingPath : undefined)
  const recordingInfo = useRecordingInfo(recording.recordingPath)
  const sortingId = sorting ? sorting.sortingId : null

  useEffect(() => {
    const numTimepoints = recordingInfo?.num_frames
    if (numTimepoints) {
      selectionDispatch({
        type: 'SetNumTimepoints',
        numTimepoints
      })
    }
  }, [recordingInfo?.num_frames])

  const {feedId} = parseWorkspaceUri(workspaceRoute.workspaceUri)

  const curationSubfeedName = useMemo(() => ({name: 'sortingCuration', sortingId}), [sortingId])
  const curationSubfeedHash = sha1OfObject(curationSubfeedName as any as JSONObject) as any as SubfeedHash
  const {state: curation} = useSubfeedReducer(feedId, curationSubfeedHash, sortingCurationReducer, {}, {actionField: false})
  const kacheryNode = useKacheryNode()
  const {channelName} = useChannel()
  const curationDispatch = useCallback((a: SortingCurationAction) => {
    initiateTask({
      kacheryNode,
      channelName,
      functionId: 'sortingview_workspace_sorting_curation_action.1',
      kwargs: {
        workspace_uri: workspaceRoute.workspaceUri,
        sorting_id: sortingId,
        action: a
      },
      functionType: 'action',
      onStatusChanged: () => {}
    })
  }, [kacheryNode, channelName, workspaceRoute.workspaceUri, sortingId])
  // const curationDispatch = undefined
  // const [curation, curationDispatch2] = useReducer(sortingCurationReducer, useMemo(() => ({}), []))
  // const handleCurationSubfeedMessages = useCallback((messages: any[]) => {
  //   messages.forEach(msg => curationDispatch2(msg))
  // }, [])
  
  // const {appendMessages: appendCurationMessages} = useSubfeed({feedId, subfeedHash: curationSubfeedHash })
  // const curationDispatch = useCallback((a: SortingCurationAction) => {
  //     appendCurationMessages([a as any as SubfeedMessage])
  // }, [appendCurationMessages])

  useEffect(() => {
    if ((!selection.timeRange) && (recordingInfo)) {
      selectionDispatch({type: 'SetTimeRange', timeRange: {min: 0, max: Math.min(recordingInfo.num_frames, recordingInfo.sampling_frequency / 10)}})
    }
  }, [selection, recordingInfo])

  // useEffect(() => {
  //   if ((sorting) && (sorting.externalUnitMetricsUri) && (!sorting.externalUnitMetrics) && (externalUnitMetricsStatus === 'waiting')) {
  //     setExternalUnitMetricsStatus('computing');
  //     hither.createHitherJob(
  //       'fetch_external_sorting_unit_metrics',
  //       { uri: sorting.externalUnitMetricsUri },
  //       { useClientCache: true }
  //     ).wait().then((externalUnitMetrics: any) => {
  //       onSetExternalUnitMetrics({ sortingId, externalUnitMetrics: externalUnitMetrics as ExternalSortingUnitMetric[] });
  //       setExternalUnitMetricsStatus('finished');
  //     })
  //   }
  // }, [onSetExternalUnitMetrics, setExternalUnitMetricsStatus, externalUnitMetricsStatus, sorting, sortingId, hither])

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
  const sv = sortingViewPlugins(plugins).filter(p => (p.name === 'MVSortingView'))[0]
  if (!sv) throw Error('Missing sorting view: MVSortingView')
  const svProps = useMemo(() => (sv.props || {}), [sv.props])

  const handleGotoRecording = useCallback(() => {
      workspaceRouteDispatch({
        type: 'gotoRecordingPage',
        recordingId: recording.recordingId
      })
  }, [workspaceRouteDispatch, recording.recordingId])

  const emptySorting: Sorting = useMemo(() => ({
    sortingId: '',
    sortingLabel: '',
    sortingPath: '',
    sortingObject: null,
    recordingId: '',
    recordingPath: '',
    recordingObject: null
  }), [])

  const emptySortingInfo: SortingInfo = useMemo(() => ({
    unit_ids: [],
    samplerate: 0,
    sorting_object: {}
  }), [])

  if ((!recording) && (sorting)) {
    return <h3>{`Recording not found: ${sorting.recordingId}`}</h3>
  }
  if (!recordingInfo) {
    return <h3>Loading recording info...</h3>
  }
  if ((!sortingInfo) && (sorting)) {
    return <h3>Loading sorting info...</h3>
  }
  

  // const selectedUnitIdsLookup: {[key: string]: boolean} = (selection.selectedUnitIds || []).reduce((m, uid) => {m[uid + ''] = true; return m}, {} as {[key: string]: boolean})
  return (
    <div className="SortingView">
      <div style={contentWrapperStyle}>
          <sv.component
            {...svProps}
            sorting={sorting || emptySorting}
            recording={recording}
            sortingInfo={sortingInfo || emptySortingInfo}
            recordingInfo={recordingInfo}
            selection={selection}
            selectionDispatch={selectionDispatch}
            curation={curation}
            curationDispatch={readOnly ? undefined : curationDispatch}
            readOnly={readOnly}
            width={contentWidth}
            height={contentHeight}
            snippetLen={snippetLen}
          />
      </div>
      <div style={footerStyle}>
        { sorting ? (
          <span>
            {`Sorting: `}
            {sorting.sortingLabel}
            {` | Recording: `}
            {<Hyperlink onClick={handleGotoRecording}>{recording.recordingLabel}</Hyperlink>}
          </span>
        ) : (
          <span>
            {`Recording: `}
            {<Hyperlink onClick={handleGotoRecording}>{recording.recordingLabel}</Hyperlink>}
          </span>
        ) }
      </div>
    </div>
  );
}

export default SortingView