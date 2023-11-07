import React from "react"
import { ViewComponentProps } from "../core-views"
import { FunctionComponent } from "react"
import { isPerformanceTestViewData, PerformanceTestView } from "./view-performance-test"
import { isTimeseriesGraphViewData, TimeseriesGraphView } from "./view-timeseries-graph"

const loadView = (o: {data: any, width: number, height: number, opts: any, ViewComponent: FunctionComponent<ViewComponentProps>}) => {
    const {data, width, height} = o
    if (isTimeseriesGraphViewData(data)) {
        return <TimeseriesGraphView data={data} width={width} height={height} />
    }
    else if (isPerformanceTestViewData(data)) {
        return <PerformanceTestView data={data} width={width} height={height} />
    }
    else return undefined
}

export default loadView