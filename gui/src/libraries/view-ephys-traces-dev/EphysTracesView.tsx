import { useFileData } from '@fi-sci/figurl-interface';
import { TimeseriesSelectionContext } from '../timeseries-views';
import { FunctionComponent, useContext, useEffect, useMemo, useState } from "react";
import EphysTracesClient, { EphysTracesInfo } from "./EphysTracesClient";
import { EphysTracesViewData } from "./EphysTracesViewData";
import TracesWidget from './TracesWidget/TracesWidget';

type Props = {
    data: EphysTracesViewData
    width: number
    height: number
}

const EphysTracesView: FunctionComponent<Props> = ({data, width, height}) => {
    const {format, uri, sortingUri} = data
    const ephysTracesClient = useMemo(() => (
        new EphysTracesClient(format, uri)
    ), [format, uri])
    const [ephysTracesInfo, setEphysTracesInfo] = useState<EphysTracesInfo>()
    useEffect(() => {
        ephysTracesClient.getInfo().then(setEphysTracesInfo)
    }, [ephysTracesClient])

    const {fileData: sortingData} = useFileData(sortingUri || '', 'json-deserialized')

    const {timeseriesSelectionDispatch} = useContext(TimeseriesSelectionContext)
    // const {timeseriesStartTimeSec, timeseriesEndTimeSec} = timeseriesSelection
    useEffect(() => {
        if (!ephysTracesInfo) return
        timeseriesSelectionDispatch({
            type: 'initializeTimeseriesSelectionTimes',
            timeseriesStartSec: 0,
            timeseriesEndSec: ephysTracesInfo.numFrames / ephysTracesInfo.samplingFrequency
        })
    }, [ephysTracesInfo, timeseriesSelectionDispatch])
    // useEffect(() => {
    //     if ((timeseriesStartTimeSec === undefined) || (timeseriesEndTimeSec === undefined)) return
    //     timeseriesSelectionDispatch({
    //         type: 'setVisibleTimeRange',
    //         startTimeSec: timeseriesStartTimeSec,
    //         endTimeSec: Math.min(timeseriesEndTimeSec, timeseriesStartTimeSec + 0.1)
    //     })
    // }, [timeseriesStartTimeSec, timeseriesEndTimeSec, timeseriesSelectionDispatch])

    if (!ephysTracesInfo) {
        return <div>Fetching info</div>
    }
    return (
        <TracesWidget
            ephysTracesClient={ephysTracesClient}
            ephysTracesInfo={ephysTracesInfo}
            sortingData={sortingData}
            width={width}
            height={height}
        />
    )
}

export default EphysTracesView