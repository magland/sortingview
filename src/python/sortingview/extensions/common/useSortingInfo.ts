import { HitherContext, HitherJob, useHitherJob } from 'labbox';
import { useContext, useRef, useState } from "react";
import { Sorting, SortingInfo } from "../pluginInterface";

export const useSortingInfo = (sortingObject: any, recordingObject: any): SortingInfo | undefined => {
    const {result: sortingInfo} = useHitherJob<SortingInfo>(
        sortingObject ? 'createjob_get_sorting_info': '',
        {sorting_object: sortingObject, recording_object: recordingObject},
        {useClientCache: true}
    )
    return sortingInfo
}

export const useSortingInfos = (sortings: Sorting[]): {[key: string]: SortingInfo} => {
    const hither = useContext(HitherContext)
    const jobs = useRef<{[key: string]: HitherJob}>({})
    const [, setCount] = useState(0) // just for triggering update
    const ret: {[key: string]: SortingInfo} = {}
    sortings.forEach(s => {
        const rid = s.sortingId
        if (!jobs.current[rid]) {
            const j = hither.createHitherJob('createjob_get_sorting_info', {recording_object: s.recordingObject, sorting_object: s.sortingObject}, {useClientCache: true})
            jobs.current[rid] = j
            j.wait().then(() => {
                setCount(c => (c + 1))
            })
            .catch(() => {
                setCount(c => (c + 1))
            })
        }
        if (jobs.current[rid].result) {
            ret[rid] = jobs.current[rid].result as SortingInfo
        }
    })
    return ret
}