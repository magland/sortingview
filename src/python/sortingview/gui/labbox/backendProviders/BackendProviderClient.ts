import GoogleSignInClient from "../googleSignIn/GoogleSignInClient";
import { ObjectStorageClient } from "../objectStorage/createObjectStorageClient";
import { PubsubChannel, PubsubMessage } from "../pubsub/createPubsubClient";
import SubfeedManager from "./feeds/SubfeedManager";
import { FeedId, SubfeedHash, SubfeedMessage } from "../kacheryTypes";
import TaskManager from "./tasks/TaskManager";
import { TaskStatus } from "./tasks/Task";
import PermissionsManager from "./PermissionsManager";

class BackendProviderClient {
    #taskManager: TaskManager
    #subfeedManager: SubfeedManager
    #permissionsManager: PermissionsManager
    constructor(private clientChannel: PubsubChannel, private serverChannel: PubsubChannel, private objectStorageClient: ObjectStorageClient, private googleSignInClient: GoogleSignInClient | undefined) {
        this.#taskManager = new TaskManager(clientChannel, objectStorageClient, googleSignInClient)
        this.#subfeedManager = new SubfeedManager(clientChannel, objectStorageClient, googleSignInClient)
        this.#permissionsManager = new PermissionsManager(clientChannel, googleSignInClient)
        serverChannel.subscribe((x: PubsubMessage) => {
            const msg = x.data
            this.#taskManager.processServerMessage(msg)
            this.#subfeedManager.processServerMessage(msg)
            this.#permissionsManager.processServerMessage(msg)
        })
    }
    initiateTask<ReturnType>(functionId: string, kwargs: {[key: string]: any}) {
        return this.#taskManager.initiateTask<ReturnType>(functionId, kwargs)
    }
    subscribeToSubfeed(opts: {feedId: FeedId, subfeedHash: SubfeedHash, onMessages: (msgs: SubfeedMessage[], messageNumber: number) => void}) {
        return this.#subfeedManager.subscribeToSubfeed(opts)
    }
    appendMessagesToSubfeed(opts: {feedId: FeedId, subfeedHash: SubfeedHash, messages: SubfeedMessage[]}) {
        return this.#subfeedManager.appendMessagesToSubfeed(opts)
    }
    async runTaskAsync<ReturnType>(functionId: string, kwargs: {[key: string]: any}) {
        return runTaskAsync<ReturnType>(this, functionId, kwargs)
    }
    public get allTasks() {
        return this.#taskManager.allTasks
    }
    public get currentUserPermissions() {
        const userId = this.googleSignInClient ? this.googleSignInClient.userId : null
        if (!userId) return null
        return this.#permissionsManager.getPermissions(userId)
    }
    onCurrentUserPermissionsChanged(callback: () => void) {
        this.#permissionsManager.onCurrentUserPermissionsChanged(callback)
    }
}

const runTaskAsync = async <ReturnType>(client: BackendProviderClient, functionId: string, kwargs: {[key: string]: any}) => {
    const task = client.initiateTask<ReturnType>(functionId, kwargs)
    if (!task) throw Error('Unable to initiate task')
    return new Promise((resolve, reject) => {
        let complete = false
        const check = () => {
            if (complete) return
            if (task.status === 'finished') {
                complete = true
                resolve(task.returnValue)
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