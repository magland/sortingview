import Ably from 'ably'
import { nodeIdToPublicKey, verifyMessageNew } from "../types/crypto_util"
import { isPubsubAuth, PubsubAuth } from "../types/kacheryHubTypes"
import { CreateSignedFileUploadUrlRequestBody, CreateSignedSubfeedMessageUploadUrlRequestBody, CreateSignedTaskResultUploadUrlRequestBody, GetChannelConfigRequestBody, GetNodeConfigRequestBody, GetPubsubAuthForChannelRequestBody, isCreateSignedFileUploadUrlResponse, isCreateSignedSubfeedMessageUploadUrlResponse, isCreateSignedTaskResultUploadUrlResponse, isGetChannelConfigResponse, isGetNodeConfigResponse, KacheryNodeRequestBody, ReportRequestBody } from "../types/kacheryNodeRequestTypes"
import { ByteCount, ChannelName, FeedId, JSONValue, NodeId, NodeLabel, PubsubChannelName, Sha1Hash, SubfeedHash, TaskId, UserId } from "../types/kacheryTypes"
import { isKacheryHubPubsubMessageData, KacheryHubPubsubMessageBody } from '../types/pubsubMessages'
import randomAlphaString from '../util/randomAlphaString'
import { AblyAuthCallback, AblyAuthCallbackCallback } from "./AblyPubsubClient"
import createPubsubClient, { PubsubClient, PubsubMessage } from "./createPubsubClient"

export type IncomingKacheryHubPubsubMessage = {
    channelName: ChannelName,
    pubsubChannelName: PubsubChannelName,
    fromNodeId: NodeId,
    message: KacheryHubPubsubMessageBody
}

class KacheryHubClient {
    #pubsubClients: {[key: string]: PubsubClient} = {}
    #incomingPubsubMessageCallbacks: {[key: string]: (x: IncomingKacheryHubPubsubMessage) => void} = {}
    constructor(private opts: {nodeId: NodeId, sendKacheryNodeRequest: (message: KacheryNodeRequestBody) => Promise<JSONValue>, ownerId?: UserId, nodeLabel?: NodeLabel, kacheryHubUrl: string}) {
    }
    async fetchNodeConfig() {
        if (!this.opts.ownerId) throw Error('No owner ID in fetchNodeConfig')
        const reqBody: GetNodeConfigRequestBody = {
            type: 'getNodeConfig',
            nodeId: this.nodeId,
            ownerId: this.opts.ownerId
        }
        const resp = await this._sendRequest(reqBody)
        if (!isGetNodeConfigResponse(resp)) {
            throw Error('Invalid response in getNodeConfig')
        }
        if (!resp.found) {
            throw Error('Node not found for getNodeConfig')
        }
        const nodeConfig = resp.nodeConfig
        if (!nodeConfig) throw Error('Unexpected, no nodeConfig')
        return nodeConfig
    }
    async fetchChannelConfig(channelName: ChannelName) {
        const reqBody: GetChannelConfigRequestBody = {
            type: 'getChannelConfig',
            channelName
        }
        const resp = await this._sendRequest(reqBody)
        if (!isGetChannelConfigResponse(resp)) {
            throw Error('Invalid response in getChannelConfig')
        }
        if (!resp.found) {
            throw Error('Channel not found for getChannelConfig')
        }
        const channelConfig = resp.channelConfig
        if (!channelConfig) throw Error('Unexpected, no channelConfig')
        return channelConfig
    }
    async fetchPubsubAuthForChannel(channelName: ChannelName) {
        const reqBody: GetPubsubAuthForChannelRequestBody = {
            type: 'getPubsubAuthForChannel',
            nodeId: this.nodeId,
            channelName
        }
        const pubsubAuth = await this._sendRequest(reqBody)
        if (!isPubsubAuth(pubsubAuth)) {
            console.warn(pubsubAuth)
            throw Error('Invalid pubsub auth')
        }
        return pubsubAuth
    }
    async report() {
        if (!this.opts.ownerId) throw Error('No owner ID in report')
        if (!this.opts.nodeLabel) throw Error('No node label in report')
        const reqBody: ReportRequestBody = {
            type: 'report',
            nodeId: this.nodeId,
            ownerId: this.opts.ownerId,
            nodeLabel: this.opts.nodeLabel
        }
        await this._sendRequest(reqBody)
    }
    async createSignedFileUploadUrl(a: {channelName: ChannelName, sha1: Sha1Hash, size: ByteCount}) {
        if (!this.opts.ownerId) throw Error('No owner ID in createSignedFileUploadUrl')
        const {channelName, sha1, size} = a
        const reqBody: CreateSignedFileUploadUrlRequestBody = {
            type: 'createSignedFileUploadUrl',
            nodeId: this.nodeId,
            ownerId: this.opts.ownerId,
            channelName,
            sha1,
            size
        }
        const x = await this._sendRequest(reqBody)
        if (!isCreateSignedFileUploadUrlResponse(x)) {
            throw Error('Unexpected response for createSignedFileUploadUrl')
        }
        return x.signedUrl
    }
    async createSignedSubfeedMessageUploadUrls(a: {channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, messageNumberRange: [number, number]}) {
        if (!this.opts.ownerId) throw Error('No owner ID in createSignedSubfeedMessageUploadUrls')
        const {channelName, feedId, subfeedHash, messageNumberRange} = a
        const reqBody: CreateSignedSubfeedMessageUploadUrlRequestBody = {
            type: 'createSignedSubfeedMessageUploadUrl',
            nodeId: this.nodeId,
            ownerId: this.opts.ownerId,
            channelName,
            feedId,
            subfeedHash,
            messageNumberRange
        }
        const x = await this._sendRequest(reqBody)
        if (!isCreateSignedSubfeedMessageUploadUrlResponse(x)) {
            throw Error('Unexpected response for createSignedFileUploadUrl')
        }
        return x.signedUrls
    }
    async createSignedTaskResultUploadUrl(a: {channelName: ChannelName, taskId: TaskId, size: ByteCount}) {
        if (!this.opts.ownerId) throw Error('No owner ID in createSignedTaskResultUploadUrl')
        const {channelName, taskId, size} = a
        const reqBody: CreateSignedTaskResultUploadUrlRequestBody = {
            type: 'createSignedTaskResultUploadUrl',
            nodeId: this.nodeId,
            ownerId: this.opts.ownerId,
            channelName,
            taskId,
            size
        }
        const x = await this._sendRequest(reqBody)
        if (!isCreateSignedTaskResultUploadUrlResponse(x)) {
            throw Error('Unexpected response for createSignedTaskResultUploadUrl')
        }
        return x.signedUrl
    }
    public get nodeId() {
        return this.opts.nodeId
    }
    clearPubsubClientsForChannels() {
        for (let k in this.#pubsubClients) {
            const client = this.#pubsubClients[k]
            client.unsubscribe()
        }
        this.#pubsubClients = {}
    }
    createPubsubClientForChannel(channelName: ChannelName, subscribeToPubsubChannels: PubsubChannelName[]) {
        if (channelName.toString() in this.#pubsubClients) {
            // todo: think about how to update the subscriptions of the auth has changed
            return
        }
        const ablyAuthCallback: AblyAuthCallback = (tokenParams: Ably.Types.TokenParams, callback: AblyAuthCallbackCallback) => {
            // We ignore tokenParams because the capabilities are determined on the server side
            this.fetchPubsubAuthForChannel(channelName).then((auth: PubsubAuth) => {
                callback('', auth.ablyTokenRequest)
            }).catch((err: Error) => {
                callback(err.message, '')
            })
        }
        const client = createPubsubClient({ably: {ablyAuthCallback}})
        for (let pubsubChannelName of subscribeToPubsubChannels) {
            client.getChannel(pubsubChannelName).subscribe((msg: PubsubMessage) => {
                const messageData = msg.data
                if (isKacheryHubPubsubMessageData(messageData)) {
                    verifyMessageNew(messageData.body as any as JSONValue, nodeIdToPublicKey(messageData.fromNodeId), messageData.signature).then(verified => {
                        if (!verified) {
                            console.warn(messageData)
                            console.warn(`Problem verifying signature on pubsub message: channel=${channelName} pubsubChannelName=${pubsubChannelName}`, messageData.fromNodeId)
                            return
                        }
                        for (let k in this.#incomingPubsubMessageCallbacks) {
                            const cb = this.#incomingPubsubMessageCallbacks[k]
                            cb({
                                channelName,
                                pubsubChannelName,
                                fromNodeId: messageData.fromNodeId,
                                message: messageData.body
                            })
                        }
                    }).catch(err => {
                        console.log('Problem verifying signature on pubsub message', err)
                    })
                }
                else {
                    console.warn(`Invalid pubsub message data: channel=${channelName}, pubsubChannel=${pubsubChannelName}`)
                }
            })
        }
        this.#pubsubClients[channelName.toString()] = client
    }
    getPubsubClientForChannel(channelName: ChannelName) {
        if (channelName.toString() in this.#pubsubClients) {
            return this.#pubsubClients[channelName.toString()]
        }
        else {
            return undefined
        }
    }
    onIncomingPubsubMessage(cb: (x: IncomingKacheryHubPubsubMessage) => void) {
        const k = randomAlphaString(10)
        this.#incomingPubsubMessageCallbacks[k] = cb
        return {cancel: () => {
            if (this.#incomingPubsubMessageCallbacks[k]) {
                delete this.#incomingPubsubMessageCallbacks[k]
            }
        }}
    }
    async _sendRequest(requestBody: KacheryNodeRequestBody): Promise<JSONValue> {
        return await this.opts.sendKacheryNodeRequest(requestBody)
    }
    _kacheryHubUrl() {
        return this.opts.kacheryHubUrl
    }
}

export default KacheryHubClient
