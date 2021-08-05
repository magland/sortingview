import { usePureCalculationTask } from 'figurl/kachery-react';
import initiateTask, { Task } from "figurl/kachery-react/initiateTask";
import useChannel from "figurl/kachery-react/useChannel";
import useKacheryNode from "figurl/kachery-react/useKacheryNode";
import { useEffect, useRef, useState } from "react";
import { Recording, RecordingInfo } from "../pluginInterface";

export const useRecordingInfo = (recordingUri: string): RecordingInfo | undefined => {
    const {channelName} = useChannel()
    const {returnValue: recordingInfo} = usePureCalculationTask<RecordingInfo>('recording_info.3', {recording_uri: recordingUri}, {channelName})
    return recordingInfo
}

export const useRecordingInfos = (recordings: Recording[]): {[key: string]: RecordingInfo | null} => {
    const tasks = useRef<{[key: string]: Task<RecordingInfo> | null}>({})
    const [, setCount] = useState(0) // just for triggering update
    useEffect(() => {
        setCount(c => (c + 1))
    }, [recordings])
    const kacheryNode = useKacheryNode()
    const {channelName} = useChannel()
    const ret: {[key: string]: RecordingInfo | null} = {}
    recordings.forEach(r => {
        const rid = r.recordingId
        const t = tasks.current[rid]
        if (t === undefined) {
            const onStatusChanged = () => {
                if ((task) && (task.status === 'finished')) {
                    setCount(c => (c + 1))
                }
            }
            const task = initiateTask<RecordingInfo>({kacheryNode, functionId: 'recording_info.3', kwargs: {recording_uri: r.recordingPath}, channelName, functionType: 'pure-calculation', onStatusChanged})
            tasks.current[rid] = task || null
        }
        else if (t !== null) {
            if (t.status === 'finished') {
                if (t.result) {
                    ret[rid] = t.result
                }
            }
        }
    })
    return ret
}