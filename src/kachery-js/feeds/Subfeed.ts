import { Mutex } from 'async-mutex';
import { hexToPublicKey, signMessage, verifySignature } from '../crypto/signatures';
import { LocalFeedManagerInterface } from '../core/ExternalInterface';
import KacheryHubInterface from '../core/KacheryHubInterface';
import { ChannelName, DurationMsec, durationMsecToNumber, FeedId, feedIdToPublicKeyHex, JSONObject, messageCount, MessageCount, messageCountToNumber, nowTimestamp, PrivateKey, PublicKey, SignedSubfeedMessage, SubfeedHash, SubfeedMessage, subfeedPosition, SubfeedPosition, subfeedPositionToNumber } from '../types/kacheryTypes';
import randomAlphaString from '../util/randomAlphaString';
import LocalSubfeedSignedMessagesManager from './LocalSubfeedSignedMessagesManager';
import RemoteSubfeedMessageDownloader from './RemoteSubfeedMessageDownloader';
// import NewOutgoingSubfeedSubscriptionManager from './NewOutgoingSubfeedSubscriptionManager';

class Subfeed {
    // Represents a subfeed, which may or may not be writeable on this node
    #publicKey: PublicKey // The public key of the feed (which is determined by the feed ID)
    #privateKey: PrivateKey | null = null // The private key (or null if this is not writeable on the local node) -- set below
    #localSubfeedSignedMessagesManager: LocalSubfeedSignedMessagesManager // The signed messages loaded from the messages file (in-memory cache)
    #isWriteable: boolean | null = null
    // #outgoingSubfeedSubscriptionManager: NewOutgoingSubfeedSubscriptionManager
    
    #initialized: boolean = false;
    #initializing: boolean = false;
    
    #onInitializedCallbacks: (() => void)[] = [];
    #onInitializeErrorCallbacks: ((err: Error) => void)[] = [];
    #newMessageListeners = new Map<ListenerId, () => void>();

    #onMessagesAddedCallbacks: (() => void)[] = []

    #subscribeToRemoteSubfeedCallbacks: ((feedId: FeedId, subfeedHash: SubfeedHash, position: SubfeedPosition) => void)[] = []

    #mutex = new Mutex()
    #remoteSubfeedMessageDownloader: RemoteSubfeedMessageDownloader

    #triggerScheduled = false

    constructor(private kacheryHubInterface: KacheryHubInterface, private feedId: FeedId, private subfeedHash: SubfeedHash, private localFeedManager: LocalFeedManagerInterface) {
        this.#publicKey = hexToPublicKey(feedIdToPublicKeyHex(feedId)); // The public key of the feed (which is determined by the feed ID)
        this.#localSubfeedSignedMessagesManager = new LocalSubfeedSignedMessagesManager(localFeedManager, feedId, subfeedHash, this.#publicKey)
        this.#remoteSubfeedMessageDownloader = new RemoteSubfeedMessageDownloader(this.kacheryHubInterface, this)
    }
    async acquireLock() {
        return await this.#mutex.acquire()
    }
    async initialize(privateKey: PrivateKey | null) {
        this.#privateKey = privateKey
        if (this.#initialized) return
        if (this.#initializing) {
            await this.waitUntilInitialized()
            return
        }
        try {
            this.#initializing = true
            this.#isWriteable = await this.localFeedManager.hasWriteableFeed(this.feedId)
            // Check whether we have the feed locally (may or may not be locally writeable)
            const existsLocally = await this.localFeedManager.subfeedExistsLocally(this.feedId, this.subfeedHash)
            if (existsLocally) {
                await this.#localSubfeedSignedMessagesManager.initializeFromLocal()
            }
            else {
                // Otherwise, we don't have it locally -- so let's just initialize things
                this.#localSubfeedSignedMessagesManager.initializeEmptyMessageList()
                // const messages = await this.localFeedManager.getSignedSubfeedMessages(this.feedId, this.subfeedHash)
                // if (messages.length !== 0) throw Error('Unexpected, messages.length is not zero')

                // don't do this
                // // Let's try to load messages from remote nodes on the network
                // if (!opts.localOnly) {
                //     await this.getSignedMessages({position: subfeedPosition(0), maxNumMessages: messageCount(10), waitMsec: scaledDurationMsec(1)})
                // }
            }
        }
        catch(err) {
            this.#onInitializeErrorCallbacks.forEach(cb => {cb(err)})
            throw err
        }

        this.#initializing = false
        this.#initialized = true

        this.#onInitializedCallbacks.forEach(cb => {cb()})
    }
    async waitUntilInitialized(): Promise<void> {
        if (this.#initialized) return
        return new Promise<void>((resolve, reject) => {
            this.#onInitializeErrorCallbacks.push((err: Error) => {
                reject(err)
            })
            this.#onInitializedCallbacks.push(() => {
                resolve()
            })
        });
    }
    getFeedId() {
        return this.feedId
    }
    getSubfeedHash() {
        return this.subfeedHash
    }
    getLocalMessages(): SubfeedMessage[] {
        return this.#localSubfeedSignedMessagesManager.getMessages()
    }
    getNumLocalMessages(): MessageCount {
        // Return the number of messages that are currently loaded into memory
        return this.#localSubfeedSignedMessagesManager.getNumMessages()
    }
    isWriteable(): boolean {
        // Whether this subfeed is writeable. That depends on whether we have a private key
        if (this.#isWriteable === null) {
            /* istanbul ignore next */
            throw Error('#isWriteable is null. Perhaps isWriteable was called before subfeed was initialized.');
        }
        return this.#isWriteable
    }
    async waitForSignedMessages({position, maxNumMessages, waitMsec}: {position: SubfeedPosition, maxNumMessages: MessageCount, waitMsec: DurationMsec}): Promise<SignedSubfeedMessage[]> {
        const check = () => {
            if (subfeedPositionToNumber(position) < messageCountToNumber(this.getNumLocalMessages())) {
                let numMessages = messageCount(messageCountToNumber(this.getNumLocalMessages()) - subfeedPositionToNumber(position))
                if (messageCountToNumber(maxNumMessages) > 0) {
                    numMessages = messageCount(Math.min(messageCountToNumber(maxNumMessages), messageCountToNumber(numMessages)))
                }
                return this.getLocalSignedMessages({position, numMessages})
            }
            else return []
        }
        const messages = check()
        if (messages.length > 0) return messages
        if (durationMsecToNumber(waitMsec) > 0) {
            this.#subscribeToRemoteSubfeedCallbacks.forEach(cb => {
                cb(this.feedId, this.subfeedHash, subfeedPosition(Number(this.getNumLocalMessages())))
            })
            return new Promise((resolve, reject) => {
                const listenerId = createListenerId()
                let completed = false
                this.#newMessageListeners.set(listenerId, () => {
                    if (completed) return
                    const msgs = check()
                    if (msgs.length > 0) {
                        completed = true
                        this.#newMessageListeners.delete(listenerId)
                        resolve(msgs)    
                    }
                })
                setTimeout(() => {
                    if (completed) return
                    completed = true
                    this.#newMessageListeners.delete(listenerId)
                    resolve([])
                }, durationMsecToNumber(waitMsec));
            })
        }
        else {
            return []
        }
    }
    getLocalSignedMessages({position, numMessages}: {position: SubfeedPosition, numMessages: MessageCount}): SignedSubfeedMessage[] {
        // Get some signed messages starting at position
        if (!this.#localSubfeedSignedMessagesManager.isInitialized()) {
            /* istanbul ignore next */
            throw Error('signed messages not initialized. Perhaps getLocalSignedMessages was called before subfeed was initialized.');
        }
        if (subfeedPositionToNumber(position) + messageCountToNumber(numMessages) <= Number(this.#localSubfeedSignedMessagesManager.getNumMessages())) {
            // If we have some messages loaded into memory, let's return those!
            let signedMessages: SignedSubfeedMessage[] = [];
            for (let i = subfeedPositionToNumber(position); i < subfeedPositionToNumber(position) + messageCountToNumber(numMessages); i++) {
                signedMessages.push(this.#localSubfeedSignedMessagesManager.getSignedMessage(i));
            }
            return signedMessages
        }
        else {
            throw Error(`Cannot get local signed messages (position=${position}, numMessages=${numMessages}, getNumMessages=${this.#localSubfeedSignedMessagesManager.getNumMessages()})`)
        }
    }
    async appendMessages(messages: SubfeedMessage[], {metaData} : {metaData: Object | undefined}) {
        if (!this.#localSubfeedSignedMessagesManager.isInitialized()) {
            /* istanbul ignore next */
            throw Error('signed messages not initialized. Perhaps appendMessages was called before subfeed was initialized.')
        }
        if (messages.length === 0) return
        if (!this.#privateKey) {
            /* istanbul ignore next */
            throw Error(`Cannot write to feed without private key: ${this.#privateKey}`)
        }
        const signedMessagesToAppend: SignedSubfeedMessage[] = []
        let previousSignature;
        if (Number(this.#localSubfeedSignedMessagesManager.getNumMessages()) > 0) {
            previousSignature = this.#localSubfeedSignedMessagesManager.getSignedMessage(Number(this.#localSubfeedSignedMessagesManager.getNumMessages()) - 1).signature;
        }
        let messageNumber = Number(this.#localSubfeedSignedMessagesManager.getNumMessages());
        for (let msg of messages) {
            let body = {
                message: msg,
                previousSignature,
                messageNumber,
                timestamp: nowTimestamp(),
                metaData: metaData ? metaData : undefined
            }
            const signedMessage: SignedSubfeedMessage = {
                body,
                signature: await signMessage(body as any as JSONObject, {publicKey: this.#publicKey, privateKey: this.#privateKey})
            }
            if (!await verifySignature(body as any as JSONObject, this.#publicKey, await signMessage(body as any as JSONObject, {publicKey: this.#publicKey, privateKey: this.#privateKey}))) {
                throw Error('Error verifying signature')
            }
            signedMessagesToAppend.push(signedMessage)
            previousSignature = signedMessage.signature
            messageNumber ++;
        }
        // CHAIN:append_messages:step(4)
        await this.appendSignedMessages(signedMessagesToAppend)
    }
    async appendSignedMessages(signedMessages: SignedSubfeedMessage[]) {
        if (!this.#localSubfeedSignedMessagesManager.isInitialized()) {
            /* istanbul ignore next */
            throw Error('signed messages not initialized. Perhaps appendSignedMessages was called before subfeed was initialized.');
        }
        if (signedMessages.length === 0)
            return;
        // it's possible that we have already appended some of these messages. Let's check
        if (signedMessages[0].body.messageNumber < messageCountToNumber(this.#localSubfeedSignedMessagesManager.getNumMessages())) {
            signedMessages = signedMessages.slice(messageCountToNumber(this.#localSubfeedSignedMessagesManager.getNumMessages()) - signedMessages[0].body.messageNumber)
        }
        if (signedMessages.length === 0)
            return;
        const signedMessagesToAppend: SignedSubfeedMessage[] = []
        let previousSignature;
        if (Number(this.#localSubfeedSignedMessagesManager.getNumMessages()) > 0) {
            previousSignature = this.#localSubfeedSignedMessagesManager.getSignedMessage(Number(this.#localSubfeedSignedMessagesManager.getNumMessages()) - 1).signature;
        }
        let messageNumber = Number(this.#localSubfeedSignedMessagesManager.getNumMessages());
        for (let signedMessage of signedMessages) {
            const body = signedMessage.body;
            const signature = signedMessage.signature;
            if (!await verifySignature(body as any as JSONObject, this.#publicKey, signature)) {
                console.warn(JSON.stringify(signedMessage, null, 4))
                throw Error(`Error verifying signature when appending signed message for: ${this.feedId} ${this.subfeedHash} ${signature}`);
            }
            if ((body.previousSignature || null) !== (previousSignature || null)) {
                throw Error(`Error in previousSignature when appending signed message for: ${this.feedId} ${this.subfeedHash} ${body.previousSignature} <> ${previousSignature}`);
            }
            if (body.messageNumber !== messageNumber) {
                // problem here
                throw Error(`Error in messageNumber when appending signed message for: ${this.feedId} ${this.subfeedHash} ${body.messageNumber} <> ${messageNumber}`);
            }
            previousSignature = signedMessage.signature;
            messageNumber ++;
            signedMessagesToAppend.push(signedMessage)
        }
        // CHAIN:append_messages:step(5)
        await this.#localSubfeedSignedMessagesManager.appendSignedMessages(signedMessagesToAppend);
        this._scheduleTriggerNewMessageCallbacks()
    }
    _scheduleTriggerNewMessageCallbacks() {
        if (this.#triggerScheduled) return
        this.#triggerScheduled = true
        setTimeout(() => {
            this.#triggerScheduled = false
            this.#newMessageListeners.forEach((listener) => {
                listener()
            })
            this.#onMessagesAddedCallbacks.forEach(cb => {
                // CHAIN:append_messages:step(9)
                cb()
            })
        }, 100)
    }
    onMessagesAdded(callback: () => void) {
        this.#onMessagesAddedCallbacks.push(callback)
    }
    onSubscribeToRemoteSubfeed(callback: (feedId: FeedId, subfeedHash: SubfeedHash, position: SubfeedPosition) => void) {
        this.#subscribeToRemoteSubfeedCallbacks.push(callback)
    }
    reportNumRemoteMessages(channelName: ChannelName, numRemoteMessages: MessageCount) {
        this.#remoteSubfeedMessageDownloader.reportNumRemoteMessages(channelName, numRemoteMessages)
    }
}

interface ListenerId extends String {
    __listenerId__: never; // phantom
}
const createListenerId = (): ListenerId => {
    return randomAlphaString(10) as any as ListenerId;
}

export default Subfeed
