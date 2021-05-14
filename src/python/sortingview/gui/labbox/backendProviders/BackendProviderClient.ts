import GoogleSignInClient from "../googleSignIn/GoogleSignInClient";
import { ObjectStorageClient } from "../objectStorage/createObjectStorageClient";
import { PubsubChannel, PubsubMessage } from "../pubsub/createPubsubClient";
import SubfeedManager from "./feeds/SubfeedManager";
import { FeedId, SubfeedHash, SubfeedMessage } from "../kacheryTypes";
import TaskManager from "./tasks/TaskManager";
import { TaskStatus } from "./tasks/Task";
import BackendInfoManager from "./BackendInfoManager";

class BackendProviderClient {
    #taskManager: TaskManager
    #subfeedManager: SubfeedManager
    #backendInfoManager: BackendInfoManager
    constructor(public backendUri: string, private clientChannel: PubsubChannel, private serverChannel: PubsubChannel, private objectStorageClient: ObjectStorageClient, private googleSignInClient: GoogleSignInClient | undefined) {
        this.#taskManager = new TaskManager(clientChannel, objectStorageClient, googleSignInClient)
        this.#subfeedManager = new SubfeedManager(clientChannel, objectStorageClient, googleSignInClient)
        this.#backendInfoManager = new BackendInfoManager(clientChannel, googleSignInClient)
        serverChannel.subscribe((x: PubsubMessage) => {
            const msg = x.data
            this.#taskManager.processServerMessage(msg)
            this.#subfeedManager.processServerMessage(msg)
            this.#backendInfoManager.processServerMessage(msg)
        })
    }
    initiateTask<ReturnType>(functionId: string, kwargs: {[key: string]: any}) {
        return this.#taskManager.initiateTask<ReturnType>(functionId, kwargs)
    }
    subscribeToSubfeed(opts: {feedId: FeedId, subfeedHash: SubfeedHash, onMessages: (msgs: SubfeedMessage[], messageNumber: number) => void, downloadAllMessages: boolean, position: number}) {
        return this.#subfeedManager.subscribeToSubfeed(opts)
    }
    appendMessagesToSubfeed(opts: {feedId: FeedId, subfeedHash: SubfeedHash, messages: SubfeedMessage[]}) {
        return this.#subfeedManager.appendMessagesToSubfeed(opts)
    }
    async runTaskAsync<ReturnType>(functionId: string, kwargs: {[key: string]: any}) {
        return await runTaskAsync<ReturnType>(this, functionId, kwargs)
    }
    public get allTasks() {
        return this.#taskManager.allTasks
    }
    public get currentUserPermissions() {
        const userId = this.googleSignInClient ? this.googleSignInClient.userId : null
        if (!userId) return null
        return this.#backendInfoManager.getPermissions(userId)
    }
    public get backendPythonProjectVersion() {
        return this.#backendInfoManager.backendPythonProjectVersion
    }
    onCurrentUserPermissionsChanged(callback: () => void) {
        this.#backendInfoManager.onCurrentUserPermissionsChanged(callback)
    }
    onBackendInfoChanged(callback: () => void) {
        this.#backendInfoManager.onBackendInfoChanged(callback)
    }
}

const runTaskAsync = async <ReturnType>(client: BackendProviderClient, functionId: string, kwargs: {[key: string]: any}): Promise<ReturnType> => {
    const task = client.initiateTask<ReturnType>(functionId, kwargs)
    if (!task) throw Error('Unable to initiate task')
    return new Promise((resolve, reject) => {
        let complete = false
        const check = () => {
            if (complete) return
            if (task.status === 'finished') {
                complete = true
                const r = task.returnValue
                if (!r) {
                    reject(new Error('Unexpected, result is null.'))
                    return
                }
                resolve(r)
            }
            else if (task.status === 'error') {
                complete = true
                reject(new Error(task.errorMessage))
            }
        }
        task.onStatusChanged((s: TaskStatus) => {
            check()
        })
        check()
    })
}

export default BackendProviderClient