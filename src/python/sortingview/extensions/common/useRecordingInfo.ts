import { HitherContext, HitherInterface, HitherJob, useHitherJob } from 'labbox';
import { useContext, useEffect, useRef, useState } from "react";
import Task from '../../../../reusable/backendProviders/tasks/Task';
import useTask from '../../../../reusable/backendProviders/tasks/useTask';
import { useBackendProviderClient } from '../../../../reusable/backendProviders/useBackendProviders';
import { Recording, RecordingInfo } from "../pluginInterface";

export const getRecordingInfo = async (a: {recordingObject: any, hither: HitherInterface}): Promise<RecordingInfo> => {
    const recordingInfoJob = a.hither.createHitherJob(
        'createjob_get_recording_info',
        { recording_object: a.recordingObject },
        {
            useClientCache: true
        }
    )
    const info = await recordingInfoJob.wait();
    return info as RecordingInfo;
}

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