import { MetricPlugin } from "./MetricPlugin";

export interface SortingUnitMetricPlugin extends MetricPlugin {
    type: 'SortingUnitMetric'
    columnLabel: string
    tooltip: string
    hitherFnName: string
    metricFnParams: {[key: string]: any}
    hitherOpts: {
        useClientCache?: boolean
    }
    component: (record: any) => JSX.Element
    isNumeric: boolean
    getValue: (record: any) => number | string
}