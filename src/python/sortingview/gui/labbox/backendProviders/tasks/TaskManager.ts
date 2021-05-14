import crypto from 'crypto';
import Task, { TaskStatus, isTaskStatus, TaskQueueMessage } from "./Task";
import checkForTaskReturnValue from './checkForTaskReturnValue';
import { PubsubChannel } from '../../pubsub/createPubsubClient';
import { ObjectStorageClient } from '../../objectStorage/createObjectStorageClient';
import { isEqualTo, isSha1Hash, isString, JSONObject, optional, Sha1Hash, sleepMsec, _validateObject } from '../../kacheryTypes';
import GoogleSignInClient from '../../googleSignIn/GoogleSignInClient';

type StatusUpdateMessage = {
    type: 'taskStatusUpdate'
    taskHash: Sha1Hash
    status: TaskStatus
    error?: string
}
const isStatusUpdateMessage = (x: any): x is StatusUpdateMessage => {
    return _validateObject(x, {
        type: isEqualTo('taskStatusUpdate'),
        taskHash: isSha1Hash,
        status: isTaskStatus,
        error: optional(isString)
    })
}

class TaskManager {
    #tasks: {[key: string]: Task<any>} = {}
    #onPublishToTaskQueue: (msg: TaskQueueMessage) => void
    constructor(private clientChannel: PubsubChannel, private objectStorageClient: ObjectStorageClient | null, private googleSignInClient: GoogleSignInClient | undefined) {
        this.#onPublishToTaskQueue = (msg: TaskQueueMessage) => {
            const msg2 = googleSignInClient ? {...msg, idToken: googleSignInClient.idToken} : msg
            clientChannel.publish({data: msg2 as any as JSONObject})
        }
        this._start()
    }
    initiateTask<ReturnType>(functionId: string, kwargs: {[key: string]: any}) {
        if (!this.objectStorageClient) {
            console.warn('Unable to initiate task. No object storage client.')
            return undefined
        }
        if (!functionId) return undefined
        const taskData = {
            functionId,
            kwargs
        }
        const taskHash = sha1OfObject(taskData)
        if ((taskHash.toString() in this.#tasks) && (!this.#tasks[taskHash.toString()].canceled)) {
            const tt = this.#tasks[taskHash.toString()] as any as Task<ReturnType>
            tt.incrementNumPointers()
            return tt
        }
        const t = new Task<ReturnType>(this.#onPublishToTaskQueue, this.objectStorageClient, taskHash, functionId, kwargs)
        this.#tasks[taskHash.toString()] = t
        return t
    }
    processServerMessage(msg: JSONObject) {
        if (isStatusUpdateMessage(msg)) {
            const taskHash = msg.taskHash
            if ((isSha1Hash(taskHash)) && (taskHash.toString() in this.#tasks && (!this.#tasks[taskHash.toString()].canceled))) {
                const t = this.#tasks[taskHash.toString()]
                if (msg.status === 'error') {
                    t._setErrorMessage(msg.error || 'unknown')
                    t._setStatus(msg.status)
                }
                else if (msg.status === 'finished') {
                    ;(async () => {
                        if (!this.objectStorageClient) return
                        const returnValue = await checkForTaskReturnValue(this.objectStorageClient, taskHash, {deserialize: true})
                        if (returnValue) {
                            t._setReturnValue(returnValue)
                            t._setStatus(msg.status)
                        }
                        else {
                            t._setErrorMessage('Problem getting return value for task')
                            t._setStatus('error')
                        }
                    })()
                }
                else {
                    t._setStatus(msg.status)
                }
            }
        }
    }
    public get allTasks() {
        return Object.values(this.#tasks).filter(t => (!t.canceled))
    }
    async _start() {
        while (true) {
            const taskHashes = Object.keys(this.#tasks)
            for (let taskHash of taskHashes) {
                const t = this.#tasks[taskHash]
                if (['error', 'finished'].includes(t.status)) {
                }
                else if (t.canceled) {
                    delete this.#tasks[taskHash]
                }
                else {
                    if (t.elapsedSecSinceKeepAliveSent >= 60 * 2) {
                        t.sendKeepAlive()
                    }
                }
            }
            await sleepMsec(2000)
        }
    }
}

export const sha1OfObject = (x: any): Sha1Hash => {
    return sha1OfString(JSONStringifyDeterministic(x))
}
export const sha1OfString = (x: string): Sha1Hash => {
    const sha1sum = crypto.createHash('sha1')
    sha1sum.update(x)
    return sha1sum.digest('hex') as any as Sha1Hash
}
// Thanks: https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify
export const JSONStringifyDeterministic = ( obj: Object, space: string | number | undefined =undefined ) => {
    var allKeys: string[] = [];
    JSON.stringify( obj, function( key, value ){ allKeys.push( key ); return value; } )
    allKeys.sort();
    return JSON.stringify( obj, allKeys, space );
}

export default TaskManager