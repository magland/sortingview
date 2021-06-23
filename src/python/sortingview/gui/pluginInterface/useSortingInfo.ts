import initiateTask, { Task } from "kachery-react/initiateTask";
import useChannel from "kachery-react/useChannel";
import useKacheryNode from "kachery-react/useKacheryNode";
import usePureCalculationTask from "kachery-react/usePureCalculationTask";
import { useEffect, useRef, useState } from "react";
import { Sorting, SortingInfo } from "./Sorting";

export const useSortingInfo = (sortingUri: string | undefined): SortingInfo | undefined => {
    const {channelName} = useChannel()
    const {returnValue: sortingInfo} = usePureCalculationTask<SortingInfo>(sortingUri ? 'sorting_info.3' : '', {sorting_uri: sortingUri}, {channelName})
    return sortingInfo
}

export const useSortingInfos = (sortings: Sorting[]): {[key: string]: SortingInfo | null} => {
    const tasks = useRef<{[key: string]: Task<SortingInfo> | null}>({})
    const [, setCount] = useState(0) // just for triggering update
    useEffect(() => {
        setCount(c => (c + 1))
    }, [sortings])
    const kacheryNode = useKacheryNode()
    const {channelName} = useChannel()
    const ret: {[key: string]: SortingInfo | null} = {}
    sortings.forEach(s => {
        const sid = s.sortingId
        const t = tasks.current[sid]
        if (t === undefined) {
            const onStatusChanged = () => {
                if ((task) && (task.status === 'finished')) {
                    setCount(c => (c + 1))
                }
            }
            const task = initiateTask<SortingInfo>({kacheryNode, functionId: 'sorting_info.3', kwargs: {sorting_uri: s.sortingPath}, channelName, functionType: 'pure-calculation', onStatusChanged})            
            tasks.current[sid] = task || null
        }
        else if (t !== null) {
            if (t.status === 'finished') {
                if (t.result) {
                    ret[sid] = t.result
                }
            }
        }
    })
    return ret
}