import { TimeseriesSelectionContext } from '../../timeseries-views';
import { FunctionComponent, useContext, useEffect, useMemo, useState } from "react";
import EphysTracesClient, { EphysTracesInfo } from "./EphysTracesClient";
import { EphysTracesViewData } from "./EphysTracesViewData";
import EphysTracesWidget from "./EphysTracesWidget";

type Props = {
    data: EphysTracesViewData
    width: number
    height: number
}

const EphysTracesView: FunctionComponent<Props> = ({data, width, height}) => {
    const {format, uri} = data
    const ephysTracesClient = useMemo(() => (
        new EphysTracesClient(format, uri)
    ), [format, uri])
    const [ephysTracesInfo, setEphysTracesInfo] = useState<EphysTracesInfo>()
    useEffect(() => {
        ephysTracesClient.getInfo().then(setEphysTracesInfo)
    }, [ephysTracesClient])

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
        <EphysTracesWidget
            ephysTracesClient={ephysTracesClient}
            ephysTracesInfo={ephysTracesInfo}
            width={width}
            height={height}
        />
    )
}

export default EphysTracesView