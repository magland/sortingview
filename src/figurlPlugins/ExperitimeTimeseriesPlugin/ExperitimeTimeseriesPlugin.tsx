import { useChannel, usePureCalculationTask } from "figurl/kachery-react";
import TaskStatusView from "figurl/kachery-react/components/TaskMonitor/TaskStatusView";
import { FigurlPlugin } from "figurl/types";
import { isString, _validateObject } from "kachery-js/types/kacheryTypes";
import { useEffect } from "react";
import { useReducer } from "react";
import { FunctionComponent } from "react";
import ExperitimeTimeseriesView from "./ExperitimeTimeseriesView/ExperitimeTimeseriesView";
import { TimeseriesInfo } from "./interface/TimeseriesInfo";
import { timeseriesSelectionReducer } from "./interface/TimeseriesSelection";

type ExperitimeTimeseriesData = {
    timeseriesUri: string
}
const isExperitimeTimeseriesData = (x: any): x is ExperitimeTimeseriesData => {
    return _validateObject(x, {
        timeseriesUri: isString
    })
}

type Props = {
    data: ExperitimeTimeseriesData
    width: number
    height: number
}

const useTimeseriesInfo = (timeseriesUri: string) => {
    const {channelName} = useChannel()
    const {returnValue: timeseriesInfo, task} = usePureCalculationTask<TimeseriesInfo>(
        timeseriesUri ? 'experitime.get_timeseries_info.2' : undefined,
        {timeseries_uri: timeseriesUri},
        {channelName}
    )
    return {timeseriesInfo, task}
}

const ExperitimeTimeseriesComponent: FunctionComponent<Props> = ({data, width, height}) => {
    const {timeseriesUri} = data
    const {timeseriesInfo, task} = useTimeseriesInfo(timeseriesUri)
    const [timeseriesSelection, timeseriesSelectionDispatch] = useReducer(timeseriesSelectionReducer, {})
    useEffect(() => {
        if (!timeseriesInfo) return
        timeseriesSelectionDispatch({
            type: 'SetTimeRange',
            timeRange: {min: timeseriesInfo.startTime, max: timeseriesInfo.endTime}
        })
    }, [timeseriesInfo])
    if (!timeseriesInfo) return (
        <TaskStatusView task={task} label="Loading timeseries info" />
    )
    return (
        <ExperitimeTimeseriesView
            timeseriesInfo={timeseriesInfo}
            width={width}
            height={height}
            opts={{channelSelectPanel: true}}
            timeseriesSelection={timeseriesSelection}
            timeseriesSelectionDispatch={timeseriesSelectionDispatch}
        />
    )
}

const getLabel = (x: ExperitimeTimeseriesData) => {
    return `ExperitimeTimeseries`
}

const ExperitimeTimeseriesPlugin: FigurlPlugin = {
    type: 'experitime.timeseries.1',
    validateData: isExperitimeTimeseriesData,
    component: ExperitimeTimeseriesComponent,
    getLabel
}

export default ExperitimeTimeseriesPlugin