import GoogleSignInClient from "../googleSignIn/GoogleSignInClient";
import { ObjectStorageClient } from "../objectStorage/createObjectStorageClient";
import { PubsubChannel, PubsubMessage } from "../pubsub/createPubsubClient";
import SubfeedManager from "./feeds/SubfeedManager";
import { FeedId, SubfeedHash, SubfeedMessage } from "./kacheryTypes/kacheryTypes";
import TaskManager from "./tasks/TaskManager";

class BackendProviderClient {
    #taskManager: TaskManager
    #subfeedManager: SubfeedManager
    constructor(private clientChannel: PubsubChannel, private serverChannel: PubsubChannel, private objectStorageClient: ObjectStorageClient, private googleSignInClient: GoogleSignInClient | undefined) {
        this.#taskManager = new TaskManager(clientChannel, objectStorageClient, googleSignInClient)
        this.#subfeedManager = new SubfeedManager(clientChannel, objectStorageClient)
        serverChannel.subscribe((x: PubsubMessage) => {
            const msg = x.data
            this.#taskManager.processServerMessage(msg)
            this.#subfeedManager.processServerMessage(msg)
        })
    }
    initiateTask<ReturnType>(functionId: string, kwargs: {[key: string]: any}) {
        return this.#taskManager.initiateTask<ReturnType>(functionId, kwargs)
    }
    subscribeToSubfeed(opts: {feedId: FeedId, subfeedHash: SubfeedHash, startPosition: number, onMessage: (msg: SubfeedMessage, messageNumber: number) => void}) {
        return this.#subfeedManager.subscribeToSubfeed(opts)
    }
    public get allTasks() {
        return this.#taskManager.allTasks
    }
}

export default BackendProviderClient