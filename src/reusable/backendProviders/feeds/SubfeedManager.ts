import GoogleSignInClient from "../../googleSignIn/GoogleSignInClient";
import { ObjectStorageClient } from "../../objectStorage/createObjectStorageClient";
import { PubsubChannel } from "../../pubsub/createPubsubClient";
import { elapsedSince, FeedId, isEqualTo, isFeedId, JSONObject, nowTimestamp, Timestamp, zeroTimestamp, _validateObject, pathifyHash, JSONValue, isNumber } from "../kacheryTypes/kacheryTypes";
import { isMessageCount, isSignedSubfeedMessage, isSubfeedHash, messageCount, MessageCount, messageCountToNumber, SignedSubfeedMessage, SubfeedHash, SubfeedMessage } from "../kacheryTypes/kacheryTypes";

export class SubfeedSubscription {
    #position = 0
    #onMessageCallbacks: ((subfeedMessages: SubfeedMessage[], messageNumber: number) => void)[] = []
    #isAlive = true
    constructor(public subfeed: Subfeed, private startPosition: number = 0) {
        this.#position = startPosition
    }
    public get position() {
        return this.#position
    }
    onMessages(callback: (subfeedMessages: SubfeedMessage[], messageNumber: number) => void) {
        this.#onMessageCallbacks.push(callback)
    }
    cancel() {
        this.#isAlive = false
    }
    initialize() {
        this._handleNewMessages()
        this.subfeed.onNewMessages(() => {
            this._handleNewMessages()  
        })
    }
    public get isAlive() {
        return this.#isAlive
    }
    _handleNewMessages() {
        if (!this.#isAlive) return
        if (this.subfeed.inMemoryMessageCount > this.#position) {
            const newMessages: SubfeedMessage[] = []
            for (let i = this.#position; i < this.subfeed.inMemoryMessageCount; i++) {
                newMessages.push(this.subfeed.inMemoryMessage(i).body.message)
            }
            this.#onMessageCallbacks.forEach(cb => {
                cb(newMessages, this.#position)
            })
            this.#position = this.subfeed.inMemoryMessageCount
        }
    }
}

class Subfeed {
    #inMemoryMessages: SignedSubfeedMessage[] = []
    #remoteMessageCount: MessageCount | undefined = undefined
    #onNewMessagesCallbacks: (() => void)[] = []
    #lastSubscriptionTimestamp: Timestamp = zeroTimestamp()
    #isDownloadingMessages = false
    constructor(private opts: {feedId: FeedId, subfeedHash: SubfeedHash, objectStorageClient: ObjectStorageClient}) {
        this._loadSubfeedJson()
    }
    public get inMemoryMessageCount() {
        return this.#inMemoryMessages.length
    }
    inMemoryMessage(i: number) {
        return this.#inMemoryMessages[i]
    }
    onNewMessages(callback: () => void) {
        this.#onNewMessagesCallbacks.push(callback)
    }
    addMessages(messages: SignedSubfeedMessage[]) {
        if (messages.length === 0) return
        for (let msg of messages) {
            this.#inMemoryMessages.push(msg)
        }
        this.#onNewMessagesCallbacks.forEach(cb => {cb()})
    }
    public set lastSubscriptionTimestamp(t: Timestamp) {
        this.#lastSubscriptionTimestamp = t
    }
    public get lastSubscriptionTimestamp() {
        return this.#lastSubscriptionTimestamp
    }
    elapsedMsecSinceLastSubscription() {
        return elapsedSince(this.#lastSubscriptionTimestamp)
    }
    setRemoteMessageCount(c: MessageCount) {
        this.#remoteMessageCount = c
        this._startDownloadingMessages()
    }
    async _startDownloadingMessages() {
        if (this.#isDownloadingMessages) return
        this.#isDownloadingMessages = true
        const messagesToAdd: SignedSubfeedMessage[] = []
        while ((this.#remoteMessageCount) && (messageCountToNumber(this.#remoteMessageCount) > this.#inMemoryMessages.length + messagesToAdd.length)) {
            const i = this.#inMemoryMessages.length + messagesToAdd.length
            try {
                const name = `feeds/${pathifyHash(this.opts.feedId)}/subfeeds/${pathifyHash(this.opts.subfeedHash)}/${i}`
                const data = await this.opts.objectStorageClient.getObjectData(name)
                if (!data) {
                    break
                }
                const msg = JSON.parse((new TextDecoder()).decode(data)) as any as JSONValue
                if (isSignedSubfeedMessage(msg)) {
                    messagesToAdd.push(msg)
                    if (this.#inMemoryMessages.length + messagesToAdd.length <= i) throw Error('Very unexpected.')
                }
                else {
                    console.warn(msg)
                    throw Error('Not a valid signed subfeed message')
                }
            }
            catch(err) {
                console.warn(`WARNING: problem downloading message data:`, err)
                break
            }
        }
        if (messagesToAdd.length > 0) {
            this.addMessages(messagesToAdd)
        }
        this.#isDownloadingMessages = false
    }
    async _loadSubfeedJson() {
        const name = `feeds/${pathifyHash(this.opts.feedId)}/subfeeds/${pathifyHash(this.opts.subfeedHash)}/subfeed.json`
        const data = await this.opts.objectStorageClient.getObjectData(name, {cacheBust: true})
        if (!data) return
        const x = JSON.parse((new TextDecoder()).decode(data))
        const ct = x.messageCount
        if ((isNumber(ct)) && (ct > 0)) {
            if ((!this.#remoteMessageCount) || (ct > messageCountToNumber(this.#remoteMessageCount))) {
                this.setRemoteMessageCount(messageCount(ct))
            }
        }
    }
}

type SubfeedUpdateMessage = {
    type: 'subfeedUpdate'
    feedId: FeedId
    subfeedHash: SubfeedHash
    messageCount: MessageCount // new total in the subfeed
}
const isSubfeedUpdateMessage = (x: any): x is SubfeedUpdateMessage => {
    return _validateObject(x, {
        type: isEqualTo('subfeedUpdate'),
        feedId: isFeedId,
        subfeedHash: isSubfeedHash,
        messageCount: isMessageCount
    })
}

class SubfeedManager {
    #subfeeds: {[key: string]: Subfeed} = {}
    constructor(private clientChannel: PubsubChannel, private objectStorageClient: ObjectStorageClient, private googleSignInClient: GoogleSignInClient | undefined) {

    }
    processServerMessage(msg: JSONObject) {
        if (isSubfeedUpdateMessage(msg)) {
            const code = this._subfeedCode(msg.feedId, msg.subfeedHash)
            if (code in this.#subfeeds) {
                const sf = this.#subfeeds[code]
                sf.setRemoteMessageCount(msg.messageCount)
            }
        }
    }
    subscribeToSubfeed(opts: {feedId: FeedId, subfeedHash: SubfeedHash, startPosition: number, onMessages: (subfeedMessages: SubfeedMessage[], messageNumber: number) => void}) {
        const code = this._subfeedCode(opts.feedId, opts.subfeedHash)
        let s = this.#subfeeds[code]
        if (!s) {
            s = new Subfeed({feedId: opts.feedId, subfeedHash: opts.subfeedHash, objectStorageClient: this.objectStorageClient})
            this.#subfeeds[code] = s
            this.clientChannel.publish({
                data: {
                    type: 'subscribeToSubfeed',
                    feedId: opts.feedId.toString(),
                    subfeedHash: opts.subfeedHash.toString()
                }
            })
        }
        s.lastSubscriptionTimestamp = nowTimestamp()
        const x = new SubfeedSubscription(s, opts.startPosition)
        x.onMessages(opts.onMessages)
        x.initialize()
        return x
    }
    appendMessagesToSubfeed(opts: {feedId: FeedId, subfeedHash: SubfeedHash, messages: SubfeedMessage[]}) {
        const msg = {
            type: 'appendMessagesToSubfeed',
            feedId: opts.feedId.toString(),
            subfeedHash: opts.subfeedHash.toString(),
            messages: opts.messages
        }
        const msg2 = this.googleSignInClient ? {...msg, idToken: this.googleSignInClient.idToken} : msg
        this.clientChannel.publish({
            data: msg2
        })
    }
    _subfeedCode(feedId: FeedId, subfeedHash: SubfeedHash) {
        return feedId + ':' + subfeedHash
    }
}

export default SubfeedManager