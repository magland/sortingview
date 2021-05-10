import { HitherContext, HitherJob, useHitherJob } from 'labbox';
import { useContext, useRef, useState } from "react";
import Task from '../../../../reusable/backendProviders/tasks/Task';
import useTask from '../../../../reusable/backendProviders/tasks/useTask';
import { useBackendProviderClient } from '../../../../reusable/backendProviders/useBackendProviders';
import { Sorting, SortingInfo } from "../pluginInterface";

export const useSortingInfo = (sortingUri: string): SortingInfo | undefined => {
    const {returnValue: sortingInfo} = useTask<SortingInfo>(sortingUri ? 'sorting_info.3' : '', {sorting_uri: sortingUri})
    return sortingInfo
}

export const useSortingInfos = (sortings: Sorting[]): {[key: string]: SortingInfo | null} => {
    const client = useBackendProviderClient()
    const tasks = useRef<{[key: string]: Task<SortingInfo> | null}>({})
    const [, setCount] = useState(0) // just for triggering update
    const ret: {[key: string]: SortingInfo | null} = {}
    if (client) {
        sortings.forEach(s => {
            const sid = s.sortingId
            const t = tasks.current[sid]
            if (t === undefined) {
                const task = client.initiateTask<SortingInfo>('sorting_info.3', {sorting_uri: s.sortingPath})
                task?.onStatusChanged(() => {
                    if (task.status === 'finished') {
                        setCount(c => (c + 1))
                    }
                })
                tasks.current[sid] = task || null
            }
            else if (t !== null) {
                if (t.status === 'finished') {
                    ret[sid] = t.returnValue
                }
            }
        })
    }
    return ret
}