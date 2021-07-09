import { FeedId, FeedName, isArrayOf, isSignedSubfeedMessage, JSONValue, PrivateKey, SignedSubfeedMessage, SubfeedHash } from "kachery-js/types/kacheryTypes";
import { GarbageMap } from "kachery-js";

class LocalSubfeed {
    #signedMessages: SignedSubfeedMessage[] = []
    constructor(public feedId: FeedId, public subfeedHash: SubfeedHash) {
        const x = localStorageGet(this._localStorageSignedMessagesKey())
        if (x) {
            if (isArrayOf(isSignedSubfeedMessage)(x)) {
                this.#signedMessages = x as any as SignedSubfeedMessage[]
            }
            else {
                console.warn('Problem with local storage signed subfeed messages', x)
            }
        }
    }
    async getSignedMessages(): Promise<SignedSubfeedMessage[]> {
        return [...this.#signedMessages] // important to return a copy here
    }
    async appendSignedMessages(messages: SignedSubfeedMessage[]) : Promise<void> {
        if (messages.length === 0) return
        for (let m of messages) {
            this.#signedMessages.push(m)
        }
        localStorageSet(this._localStorageSignedMessagesKey(), this.#signedMessages)
    }
    _localStorageSignedMessagesKey() {
        return _getLocalStorageSignedMessagesKey(this.feedId, this.subfeedHash)
    }
}

const _getLocalStorageSignedMessagesKey = (feedId: FeedId, subfeedHash: SubfeedHash) => {
    return `feeds/${feedId}/subfeeds/${subfeedHash}/signedMessages`
}

class LocalFeed {
    #subfeeds = new GarbageMap<SubfeedHash, LocalSubfeed>(null)
    constructor(public feedId: FeedId) {
    }
    getSubfeed(subfeedHash: SubfeedHash) {
        if (!this.#subfeeds.has(subfeedHash)) {
            this.#subfeeds.set(subfeedHash, new LocalSubfeed(this.feedId, subfeedHash))
        }
        const sf = this.#subfeeds.get(subfeedHash)
        if (!sf) throw Error('Unexpected: No local subfeed')
        return sf
    }
}

class BrowserLocalFeedManager {
    #localFeeds = new GarbageMap<FeedId, LocalFeed>(null)
    async createFeed(feedName: FeedName | null) : Promise<FeedId> {
        throw Error('not implemented')
    }
    async deleteFeed(feedId: FeedId) : Promise<void> {
        throw Error('not implemented')
    }
    async getFeedId(feedName: FeedName) : Promise<FeedId | null> {
        return null
    }
    async hasWriteableFeed(feedId: FeedId) : Promise<boolean> {
        return false
    }
    async getPrivateKeyForFeed(feedId: FeedId) : Promise<PrivateKey | null> {
        return null
    }
    async subfeedExistsLocally(feedId: FeedId, subfeedHash: SubfeedHash) : Promise<boolean> {
        const f = this.#localFeeds.get(feedId)
        if (f) {
            if (f.getSubfeed(subfeedHash)) return true
        }
        const x = localStorageGet(_getLocalStorageSignedMessagesKey(feedId, subfeedHash))
        if (x) return true
        return false
    }
    async getSignedSubfeedMessages(feedId: FeedId, subfeedHash: SubfeedHash) : Promise<SignedSubfeedMessage[]> {
        if (!this.#localFeeds.has(feedId)) {
            this.#localFeeds.set(feedId, new LocalFeed(feedId))
        }
        const f = this.#localFeeds.get(feedId)
        if (!f) throw Error(`Unexpected: no local feed: ${feedId}`)
        const sf = f.getSubfeed(subfeedHash)
        return await sf.getSignedMessages()
    }
    async appendSignedMessagesToSubfeed(feedId: FeedId, subfeedHash: SubfeedHash, messages: SignedSubfeedMessage[]) : Promise<void> {
        if (!this.#localFeeds.has(feedId)) {
            this.#localFeeds.set(feedId, new LocalFeed(feedId))
        }
        const f = this.#localFeeds.get(feedId)
        if (!f) throw Error(`Unexpected: no local feed: ${feedId}`)
        const sf = f.getSubfeed(subfeedHash)
        await sf.appendSignedMessages(messages)
    }
}

const localStorageGet = (key: string) => {
    let x: string | null
    try {
        x = localStorage.getItem(key)
    }
    catch(err) {
        return undefined
    }
    if (!x) return undefined
    let y: JSONValue
    try {
        y = JSON.parse(x)
    }
    catch(err) {
        return undefined
    }
    return y
}

const localStorageSet = (key: string, value: any) => {
    let x: string
    try {
        x = JSON.stringify(value)
    }
    catch(err) {
        console.warn('Problem stringifying in localStorageSet', key, value)
        return
    }
    try {
        localStorage.setItem(key, x)
    }
    catch(err) {
        console.warn('Problem storing item in localStorageSet', key, value)
    }
}

export default BrowserLocalFeedManager