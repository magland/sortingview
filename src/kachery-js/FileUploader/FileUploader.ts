import axios from "axios";
import { ByteCount, ChannelName, FileKey, fileKeyHash, scaledDurationMsec, Sha1Hash, sha1OfObject, UrlString } from "../types/kacheryTypes";
import GarbageMap from "../util/GarbageMap";
import NodeStats from "../NodeStats";
import { KacheryStorageManagerInterface } from "../ExternalInterface";

export type SignedFileUploadUrlCallback = (a: {channelName: ChannelName, sha1: Sha1Hash, size: ByteCount}) => Promise<UrlString>

class FileUploadTask {
    #complete = false
    #onCompleteCallbacks: (() => void)[] = []
    #status: 'waiting' | 'running' | 'finished' | 'error' = 'waiting'
    #error: Error | undefined = undefined
    constructor(private channelName: ChannelName, private fileKey: FileKey, private fileSize: ByteCount, private signedFileUploadUrlCallback: SignedFileUploadUrlCallback, private kacheryStorageManager: KacheryStorageManagerInterface, private nodeStats: NodeStats) {
        this._start()
    }
    async wait() {
        if (!this.#complete) {
            await new Promise<void>((resolve) => {
                if (this.#complete) return
                this.#onCompleteCallbacks.push(() => {
                    resolve()
                })
            })
        }
        if (this.#status === 'finished') {
            return
        }
        else if (this.#status === 'error') {
            throw this.#error
        }
        else {
            throw Error(`Unexpected status for completed: ${this.#status}`)
        }
    }
    async _start() {
        this.#status = 'running'
        try {
            const url = await this.signedFileUploadUrlCallback({channelName: this.channelName, sha1: this.fileKey.sha1, size: this.fileSize})
            const {stream: dataStream, size} = await this.kacheryStorageManager.getFileReadStream(this.fileKey)
            const resp = await axios.put(url.toString(), dataStream, {
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Length': Number(size)
                },
                maxBodyLength: Infinity, // apparently this is important
                maxContentLength: Infinity // apparently this is important
            })
            if (resp.status !== 200) {
                throw Error(`Error in upload: ${resp.statusText}`)
            }
            this.nodeStats.reportBytesSent(size, this.channelName)
            this.#status = 'finished'
        }
        catch(err) {
            this.#error = err
            this.#status = 'error'
        }
        this.#complete = true
        this.#onCompleteCallbacks.forEach(cb => cb())
    }
}

class FileUploadTaskManager {
    #tasks = new GarbageMap<Sha1Hash, FileUploadTask>(scaledDurationMsec(1000 * 60 * 60))
    constructor(private signedFileUploadUrlCallback: SignedFileUploadUrlCallback, private kacheryStorageManager: KacheryStorageManagerInterface, private nodeStats: NodeStats) {

    }
    getTask(channelName: ChannelName, fileKey: FileKey, fileSize: ByteCount) {
        const code = sha1OfObject({channelName: channelName.toString(), fileKeyHash: fileKeyHash(fileKey).toString()})
        const t = this.#tasks.get(code)
        if (t) return t
        const newTask = new FileUploadTask(channelName, fileKey, fileSize, this.signedFileUploadUrlCallback, this.kacheryStorageManager, this.nodeStats)
        this.#tasks.set(code, newTask)
        return newTask
    }
}

class FileUploader {
    #taskManager: FileUploadTaskManager
    constructor(private signedFileUploadUrlCallback: SignedFileUploadUrlCallback, private kacheryStorageManager: KacheryStorageManagerInterface, private nodeStats: NodeStats) {
        this.#taskManager = new FileUploadTaskManager(this.signedFileUploadUrlCallback, this.kacheryStorageManager, this.nodeStats)
    }
    async uploadFileToBucket(args: {channelName: ChannelName, fileKey: FileKey, fileSize: ByteCount}) {
        const {channelName, fileKey, fileSize} = args
        const task = this.#taskManager.getTask(channelName, fileKey, fileSize)
        await task.wait()
    }
}

export default FileUploader