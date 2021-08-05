import Splitter from 'figurl/labbox-react/components/Splitter/Splitter';
import React, { useMemo, useReducer } from 'react';
import { RecordingInfo, RecordingSelection, RecordingSelectionDispatch, recordingSelectionReducer, SortingSelection } from '../../../pluginInterface';
import useSpikeAmplitudesData from '../../spikeamplitudes/SpikeAmplitudesView/useSpikeAmplitudesData';
import ElectrodeGeometryView from './ElectrodeGeometryView';
import TimeseriesWidgetNew from './TimeseriesWidgetNew';
import useTimeseriesData from './useTimeseriesModel';

interface Props {
    recordingObject: any
    recordingInfo: RecordingInfo
    width: number
    height: number
    opts: {
        channelSelectPanel?: boolean
    }
    recordingSelection?: RecordingSelection
    recordingSelectionDispatch?: RecordingSelectionDispatch

    // for spike markers
    sortingObject?: any
    sortingSelection?: SortingSelection
    snippetLen?: [number, number]
}

// interface TimeseriesInfo {
//     samplerate: number
//     segment_size: number
//     num_channels: number
//     channel_ids: number[]
//     channel_locations: (number[])[]
//     num_timepoints: number
//     y_offsets: number[]
//     y_scale_factor: number
//     initial_y_scale_factor: number
// }

const TimeseriesViewNew = (props: Props) => {
    const opts = props.opts
    const recordingInfo = props.recordingInfo
    const timeseriesData = useTimeseriesData(props.recordingObject, props.recordingInfo)
    const [recordingSelectionInternal, recordingSelectionInternalDispatch] = useReducer(recordingSelectionReducer, {})

    const spikeAmplitudesData = useSpikeAmplitudesData(props.recordingObject, props.sortingObject, props.snippetLen)

    const recordingSelection = props.recordingSelection || recordingSelectionInternal
    const recordingSelectionDispatch = props.recordingSelectionDispatch || recordingSelectionInternalDispatch
    const selectedElectrodeIds = useMemo(() => (recordingSelection.selectedElectrodeIds || []), [recordingSelection.selectedElectrodeIds])
    const visibleElectrodeIds = useMemo(() => (recordingSelection.visibleElectrodeIds || recordingInfo.channel_ids), [recordingSelection.visibleElectrodeIds, recordingInfo.channel_ids])

    const y_scale_factor = 1 / (props.recordingInfo.noise_level || 1) * 1/10

    if (timeseriesData) {
        return (
            <div>
                <Splitter
                    width={props.width}
                    height={props.height}
                    initialPosition={200}
                >
                    {
                        opts.channelSelectPanel && (
                            <ElectrodeGeometryView
                                recordingInfo={props.recordingInfo}
                                width={0} // filled in above
                                height={0} // filled in above
                                visibleElectrodeIds={visibleElectrodeIds}
                                selection={recordingSelection}
                                selectionDispatch={recordingSelectionDispatch}
                            />
                        )
                    }
                    {
                        ((!opts.channelSelectPanel) || (selectedElectrodeIds.length > 0) || (visibleElectrodeIds.length <= 12)) ? (
                            <TimeseriesWidgetNew
                                timeseriesData={timeseriesData}
                                channel_ids={props.recordingInfo.channel_ids}
                                channel_locations={props.recordingInfo.geom}
                                num_timepoints={props.recordingInfo.num_frames}
                                // y_offsets={timeseriesInfo.y_offsets}
                                // y_scale_factor={timeseriesInfo.y_scale_factor * (timeseriesInfo.initial_y_scale_factor || 1)}
                                y_scale_factor={y_scale_factor}
                                width={props.width} // filled in above
                                height={props.height} // filled in above
                                visibleChannelIds={opts.channelSelectPanel ? (selectedElectrodeIds.length > 0 ? selectedElectrodeIds : visibleElectrodeIds) : null}
                                recordingSelection={recordingSelection}
                                recordingSelectionDispatch={recordingSelectionDispatch}
                                spikeAmplitudesData={spikeAmplitudesData || undefined}
                                sortingSelection={props.sortingSelection}
                            />
                        ) : (
                            <div>Select one or more electrodes</div>
                        )
                    }
                </Splitter>
            </div>
        )
    }
    else {
        return (
            <div>Creating timeseries model</div>
        )
    }
}

// const calculateTimeseriesInfo = async (recordingObject: RecordingObject, hither: HitherInterface): Promise<TimeseriesInfo> => {
//     let info: TimeseriesInfo
//     try {
//         info = await hither.createHitherJob(
//             'createjob_calculate_timeseries_info',
//             { recording_object: recordingObject },
//             {
//                 useClientCache: true
//             }
//         ).wait() as TimeseriesInfo
//     }
//     catch (err) {
//         console.error(err);
//         throw Error('Problem calculating timeseries info.')
//     }
//     if (!info) {
//         throw Error('Unexpected problem calculating timeseries info: info is null.')
//     }
//     return info
// }

export default TimeseriesViewNew