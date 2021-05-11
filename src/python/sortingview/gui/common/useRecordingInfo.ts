import { useEffect, useRef, useState } from "react";
import { Task } from '../labbox';
import { useTask } from '../labbox';
import { useBackendProviderClient } from '../labbox';
import { Recording, RecordingInfo } from "../pluginInterface";

export const useRecordingInfo = (recordingUri: string): RecordingInfo | undefined => {
    const {returnValue: recordingInfo} = useTask<RecordingInfo>('recording_info.3', {recording_uri: recordingUri})
    return recordingInfo
}

export const useRecordingInfos = (recordings: Recording[]): {[key: string]: RecordingInfo | null} => {
    const client = useBackendProviderClient()
    const tasks = useRef<{[key: string]: Task<RecordingInfo> | null}>({})
    const [, setCount] = useState(0) // just for triggering update
    useEffect(() => {
        setCount(c => (c + 1))
    }, [recordings])
    const ret: {[key: string]: RecordingInfo | null} = {}
    if (client) {
        recordings.forEach(r => {
            const rid = r.recordingId
            const t = tasks.current[rid]
            if (t === undefined) {
                const task = client.initiateTask<RecordingInfo>('recording_info.3', {recording_uri: r.recordingPath})
                task?.onStatusChanged(() => {
                    if (task.status === 'finished') {
                        setCount(c => (c + 1))
                    }
                })
                tasks.current[rid] = task || null
            }
            else if (t !== null) {
                if (t.status === 'finished') {
                    ret[rid] = t.returnValue
                }
            }
        })
    }
    return ret
}