import { KacheryStorageManagerInterface, LocalFeedManagerInterface, MutableManagerInterface } from './ExternalInterface'
import FeedManager from './feeds/FeedManager'
import FileUploader, { SignedFileUploadUrlCallback } from './FileUploader/FileUploader'
import { getStats, GetStatsOpts } from './getStats'
import KacheryHubInterface from './KacheryHubInterface'
import NodeStats from './NodeStats'
import { KacheryNodeRequestBody } from './types/kacheryNodeRequestTypes'
import { ByteCount, ChannelName, FileKey, isArrayOf, isString, JSONValue, NodeId, NodeLabel, Sha1Hash, Signature, UserId } from './types/kacheryTypes'
import { KacheryHubPubsubMessageBody } from './types/pubsubMessages'

export interface KacheryDaemonNodeOpts {
    kacheryHubUrl: string
    verifySubfeedMessageSignatures: boolean
}

class KacheryDaemonNode {
    #nodeId: NodeId
    #feedManager: FeedManager
    #mutableManager: MutableManagerInterface
    #kacheryStorageManager: KacheryStorageManagerInterface
    #stats = new NodeStats()
    #clientAuthCode = {current: '', previous: ''}
    #otherClientAuthCodes: string[] = []
    #kacheryHubInterface: KacheryHubInterface
    #fileUploader: FileUploader
    constructor(private p: {
        verbose: number,
        nodeId: NodeId,
        sendKacheryNodeRequest: (requestBody: KacheryNodeRequestBody) => Promise<JSONValue>,
        signPubsubMessage: (messageBody: KacheryHubPubsubMessageBody) => Promise<Signature>,
        label: NodeLabel,
        ownerId?: UserId,
        kacheryStorageManager: KacheryStorageManagerInterface,
        mutableManager: MutableManagerInterface,
        localFeedManager: LocalFeedManagerInterface,
        opts: KacheryDaemonNodeOpts
    }) {
        this.#nodeId = p.nodeId
        this.#kacheryStorageManager = p.kacheryStorageManager
        this.#mutableManager = p.mutableManager

        this._updateOtherClientAuthCodes()
        this.#mutableManager.onSet((k: JSONValue) => {
            if (k === '_other_client_auth_codes') {
                this._updateOtherClientAuthCodes()
            }
        })

        this.#kacheryHubInterface = new KacheryHubInterface({nodeId: this.#nodeId, sendKacheryNodeRequest: p.sendKacheryNodeRequest, signPubsubMessage: p.signPubsubMessage, ownerId: p.ownerId, nodeLabel: p.label, kacheryHubUrl: p.opts.kacheryHubUrl, nodeStats: this.#stats})

        this.#kacheryHubInterface.onIncomingFileRequest(({fileKey, channelName, fromNodeId}) => {
            this._handleIncomingFileRequest({fileKey, channelName, fromNodeId})
        })
        this.#kacheryHubInterface.onRequestSubfeed((channelName, feedId, subfeedHash, position) => {
            this.#feedManager.createOrRenewIncomingSubfeedSubscription(channelName, feedId, subfeedHash, position)
        })
        this.#kacheryHubInterface.onUpdateSubfeedMessageCount((channelName, feedId, subfeedHash, messageCount) => {
            this.#feedManager.reportSubfeedMessageCountUpdate(channelName, feedId, subfeedHash, messageCount)
        })

        const signedFileUploadUrlCallback: SignedFileUploadUrlCallback = async (a: {channelName: ChannelName, sha1: Sha1Hash, size: ByteCount}) => {
            return await this.#kacheryHubInterface.createSignedFileUploadUrl(a)
        }

        this.#fileUploader = new FileUploader(signedFileUploadUrlCallback, this.#kacheryStorageManager, this.#stats)

        // The feed manager -- each feed is a collection of append-only logs
        this.#feedManager = new FeedManager(this.#kacheryHubInterface, p.localFeedManager, this.#stats, {verifySignatures: this.p.opts.verifySubfeedMessageSignatures})
    }
    nodeId() {
        return this.#nodeId
    }
    kacheryStorageManager() {
        return this.#kacheryStorageManager
    }
    stats() {
        return this.#stats
    }
    cleanup() {
    }
    feedManager() {
        return this.#feedManager
    }
    mutableManager() {
        return this.#mutableManager
    }
    getStats(o: GetStatsOpts) {
        return getStats(this, o)
    }
    nodeLabel() {
        return this.p.label
    }
    ownerId() {
        return this.p.ownerId
    }
    setClientAuthCode(code: string, previousCode: string) {
        this.#clientAuthCode = {
            current: code,
            previous: previousCode
        }
    }
    verifyClientAuthCode(code: string, opts: {browserAccess: boolean}) {
        if (code === this.#clientAuthCode.current) return true
        if ((this.#clientAuthCode.previous) && (code === this.#clientAuthCode.previous)) return true
        if (!opts.browserAccess) {
            return false
        }
        if (this.#otherClientAuthCodes.includes(code)) return true
        return false
    }
    kacheryHubInterface() {
        return this.#kacheryHubInterface
    }
    async _updateOtherClientAuthCodes() {
        const x = await this.#mutableManager.get('_other_client_auth_codes')
        if (x) {
            const v = x.value
            if ((isArrayOf(isString))(v)) {
                this.#otherClientAuthCodes = v as string[]
            }
        }
    }
    async _handleIncomingFileRequest(args: {fileKey: FileKey, channelName: ChannelName, fromNodeId: NodeId}) {
        const x = await this.#kacheryStorageManager.findFile(args.fileKey)
        if (x.found) {
            this.#kacheryHubInterface.sendUploadFileStatusMessage({channelName: args.channelName, fileKey: args.fileKey, status: 'started'})
            // todo: use pending status and only upload certain number at a time
            await this.#fileUploader.uploadFileToBucket({channelName: args.channelName, fileKey: args.fileKey, fileSize: x.size})
            this.#kacheryHubInterface.sendUploadFileStatusMessage({channelName: args.channelName, fileKey: args.fileKey, status: 'finished'})
        }
    }
}

export default KacheryDaemonNode
