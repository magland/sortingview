import { SortingCuration } from "./SortingCuration";

export type ExternalSortingUnitMetric = {name: string, label: string, tooltip?: string, data: {[key: string]: number}}
export interface SortingInfo {
    unit_ids: number[]
    samplerate: number
    sorting_object: any
}

export interface Sorting {
    sortingId: string
    sortingLabel: string
    sortingPath: string
    sortingObject: any
    recordingId: string
    recordingPath: string
    recordingObject: any

    unitMetricsUri?: string
}