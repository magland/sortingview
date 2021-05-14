import GoogleSignInClient from "../../googleSignIn/GoogleSignInClient";
import { ObjectStorageClient } from "../../objectStorage/createObjectStorageClient";
import { PubsubChannel } from "../../pubsub/createPubsubClient";
import { elapsedSince, FeedId, isEqualTo, isFeedId, JSONObject, nowTimestamp, Timestamp, zeroTimestamp, _validateObject, pathifyHash, JSONValue, isNumber } from "../../kacheryTypes";
import { isMessageCount, isSignedSubfeedMessage, isSubfeedHash, messageCount, MessageCount, messageCountToNumber, SubfeedHash, SubfeedMessage } from "../../kacheryTypes";

export class SubfeedView {
    #position: number
    #isAlive = true
    #handlingNewMessages = false
    constructor(public subfeed: Subfeed, private opts: {downloadAllMessages: boolean, position: number, onNewMessages: ((subfeedMessages: SubfeedMessage[], messageNumber: number) => void)}) {
        this.#position = opts.position
        if (opts.downloadAllMessages) {
            subfeed.setDownloadAllMessages(true)
        }
        this._initialize()
    }
    public get position() {
        if (this.#position < 0) {
            if (this.subfeed.numMessages === undefined) return undefined
            return this.subfeed.numMessages + this.#position
        }
        return this.#position
    }
    cancel() {
        this.#isAlive = false
    }
    _initialize() {
        this._handleNewMessages()
        this.subfeed.onNewMessages(() => {
            this._handleNewMessages()  
        })
    }
    public get isAlive() {
        return this.#isAlive
    }
    async _handleNewMessages() {
        if (!this.#isAlive) return
        if (this.#handlingNewMessages) return
        this.#handlingNewMessages = true
        try {
            // handle negative starting position (to get last messages)
            if ((this.#position < 0) && (this.subfeed.numMessages !== undefined) && (this.subfeed.numMessages >= -this.#position)) {
                this.#position = this.#position + this.subfeed.numMessages
            }
            if ((this.subfeed.numMessages !== undefined) && (this.subfeed.numMessages > this.#position) && (this.#position >= 0)) {
                const newMessages: SubfeedMessage[] = []
                let i = this.#position
                while (i < this.subfeed.numMessages) {
                    const msg = await this.subfeed.getMessage(i)
                    if (!msg) throw Error(`Error getting message of ${this.subfeed.feedId} ${this.subfeed.subfeedHash} ${i}`)
                    newMessages.push(msg)
                    i ++
                }
                if (newMessages.length > 0) {
                    this.opts.onNewMessages(newMessages, this.#position)
                    this.#position = this.#position + newMessages.length
                }
            }
        }
        finally {
            this.#handlingNewMessages = false
        }
    }
}

// Only one subfeed object per subfeed
class Subfeed {
    #inMemoryMessages: {[key: number]: SubfeedMessage | null} = {}
    #numMessages: MessageCount | undefined = undefined
    #onNewMessagesCallbacks: (() => void)[] = []
    #lastSubscriptionTimestamp: Timestamp = zeroTimestamp()
    #isDownloadingMessages = false
    #downloadAllMessages = false
    constructor(private opts: {feedId: FeedId, subfeedHash: SubfeedHash, objectStorageClient: ObjectStorageClient}) {
        this._loadSubfeedJson()
    }
    public get numMessages() {
        return this.#numMessages ? messageCountToNumber(this.#numMessages) : undefined
    }
    public get feedId() {
        return this.opts.feedId
    }
    public get subfeedHash() {
        return this.opts.subfeedHash
    }
    setDownloadAllMessages(val: boolean) {
        if (val === this.#downloadAllMessages) return
        this.#downloadAllMessages = val
        if (this.#downloadAllMessages) this._startDownloadingMessages()
    }
    async getMessage(i: number) {
        if (!(i in this.#inMemoryMessages)) {
            const name = `feeds/${pathifyHash(this.opts.feedId)}/subfeeds/${pathifyHash(this.opts.subfeedHash)}/${i}`
            const data = await this.opts.objectStorageClient.getObjectData(name)
            if (!data) {
                this.#inMemoryMessages[i] = null
            }
            else {
                const msg = JSON.parse((new TextDecoder()).decode(data)) as any as JSONValue
                if (isSignedSubfeedMessage(msg)) {
                    this.#inMemoryMessages[i] = msg.body.message
                }
                else {
                    console.warn('Not a valid signed subfeed message', msg)
                    this.#inMemoryMessages[i] = null
                }
            }
        }
        return this.#inMemoryMessages[i] || null
    }
    onNewMessages(callback: () => void) {
        this.#onNewMessagesCallbacks.push(callback)
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
    _setNumMessages(c: MessageCount) {
        if (c !== this.#numMessages) {
            this.#numMessages = c
            this.#onNewMessagesCallbacks.forEach(cb => {cb()})
            if (this.#downloadAllMessages) {
                this._startDownloadingMessages()
            }
        }
    }
    async _startDownloadingMessages() {
        if (this.#isDownloadingMessages) return
        this.#isDownloadingMessages = true
        try {
            let i = 0
            while ((this.#numMessages) && (i < messageCountToNumber(this.#numMessages))) {
                await this.getMessage(i)
                i ++
            }
        }
        finally {
            this.#isDownloadingMessages = false
        }
    }
    // _addMessages(messages: SignedSubfeedMessage[]) {
    //     if (messages.length === 0) return
    //     for (let msg of messages) {
    //         this.#inMemoryMessages.push(msg)
    //     }
    //     this.#onNewMessagesCallbacks.forEach(cb => {cb()})
    // }
    async _loadSubfeedJson() {
        const name = `feeds/${pathifyHash(this.opts.feedId)}/subfeeds/${pathifyHash(this.opts.subfeedHash)}/subfeed.json`
        const data = await this.opts.objectStorageClient.getObjectData(name, {cacheBust: true})
        if (!data) return
        const x = JSON.parse((new TextDecoder()).decode(data))
        const ct = x.messageCount
        if ((isNumber(ct)) && (ct > 0)) {
            if ((!this.#numMessages) || (ct > messageCountToNumber(this.#numMessages))) {
                this._setNumMessages(messageCount(ct))
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
                sf._setNumMessages(msg.messageCount)
            }
        }
    }
    subscribeToSubfeed(opts: {feedId: FeedId, subfeedHash: SubfeedHash, onMessages: (subfeedMessages: SubfeedMessage[], messageNumber: number) => void, downloadAllMessages: boolean, position: number}) {
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
        const x = new SubfeedView(s, {downloadAllMessages: opts.downloadAllMessages, position: opts.position, onNewMessages: opts.onMessages})
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