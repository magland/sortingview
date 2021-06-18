import axios from 'axios';
import { LocalFeedManagerInterface } from '../core/ExternalInterface';
import KacheryHubInterface from '../core/KacheryHubInterface';
import NodeStats from '../core/NodeStats';
import { byteCount, ChannelName, DurationMsec, durationMsecToNumber, FeedId, FeedName, feedSubfeedId, FeedSubfeedId, messageCount, MessageCount, messageCountToNumber, scaledDurationMsec, SignedSubfeedMessage, SubfeedHash, SubfeedMessage, SubfeedPosition, subfeedPosition, subfeedPositionToNumber, SubfeedWatch, SubfeedWatchesRAM, SubfeedWatchName } from '../types/kacheryTypes';
import GarbageMap from '../util/GarbageMap';
import { sleepMsec } from '../util/util';
import IncomingSubfeedSubscriptionManager from './IncomingSubfeedSubscriptionManager';
import OutgoingSubfeedSubscriptionManager from './OutgoingSubfeedSubscriptionManager';
import Subfeed from './Subfeed';

class FeedManager {
    // Manages the local feeds and access to the remote feeds in channel
    #subfeeds = new GarbageMap<FeedSubfeedId, Subfeed>(scaledDurationMsec(8 * 60 * 1000)) // The subfeed instances (Subfeed()) that have been loaded into memory
    #incomingSubfeedSubscriptionManager: IncomingSubfeedSubscriptionManager
    #outgoingSubfeedSubscriptionManager: OutgoingSubfeedSubscriptionManager
    constructor(private kacheryHubInterface: KacheryHubInterface, private localFeedManager: LocalFeedManagerInterface, private nodeStats: NodeStats) {
        this.#incomingSubfeedSubscriptionManager = new IncomingSubfeedSubscriptionManager()
        this.#outgoingSubfeedSubscriptionManager = new OutgoingSubfeedSubscriptionManager()

        this.#outgoingSubfeedSubscriptionManager.onSubscribeToRemoteSubfeed((feedId: FeedId, subfeedHash: SubfeedHash, position: SubfeedPosition) => {
            this.kacheryHubInterface.subscribeToRemoteSubfeed(feedId, subfeedHash, position)
        })
    }
    async createFeed({ feedName } : {feedName: FeedName | null }) {
        // Create a new writeable feed on this node and return the ID of the new feed
        return await this.localFeedManager.createFeed(feedName)
    }
    async deleteFeed({ feedId }: {feedId: FeedId}) {
        await this.localFeedManager.deleteFeed(feedId)
    }
    async getFeedId({ feedName }: { feedName: FeedName }) {
        return await this.localFeedManager.getFeedId(feedName)
    }
    async hasWriteableFeed(feedId: FeedId) {
        return await this.localFeedManager.hasWriteableFeed(feedId)
    }
    async appendMessages(args: { feedId: FeedId, subfeedHash: SubfeedHash, messages: SubfeedMessage[]}) {
        // Append messages to a subfeed (must be in a writeable feed on this node)

        // Load the subfeed and make sure it is writeable
        const subfeed = await this._loadSubfeed(args.feedId, args.subfeedHash);
        if (!subfeed) {
            /* istanbul ignore next */
            throw Error(`Unable to load subfeed: ${args.feedId} ${args.subfeedHash}`);
        }
        if (!subfeed.isWriteable()) {
            throw Error(`Subfeed is not writeable: ${args.feedId} ${args.subfeedHash}`);
        }

        const release = await subfeed.acquireLock()
        try {
            // Append the messages
            // CHAIN:append_messages:step(3)
            await subfeed.appendMessages(args.messages, {metaData: undefined});
        }
        finally {
            release()
        }
    }
    async getNumLocalMessages({ feedId, subfeedHash }: {feedId: FeedId, subfeedHash: SubfeedHash}): Promise<MessageCount> {
        // Get the total number of messages in the local feed only
        // future: we may want to optionally do a search, and retrieve the number of messages without retrieving the actual messages
        const subfeed = await this._loadSubfeed(feedId, subfeedHash);
        if (!subfeed) {
            /* istanbul ignore next */
            throw Error(`Unable to load subfeed: ${feedId} ${subfeedHash}`);
        }
        return subfeed.getNumLocalMessages()
    }
    async getFinalLocalMessage({ feedId, subfeedHash } : {feedId: FeedId, subfeedHash: SubfeedHash}): Promise<SubfeedMessage | null> {
        const subfeed = await this._loadSubfeed(feedId, subfeedHash);
        if (!subfeed) {
            return null
        }

        // important to do it this way so we can load new messages into memory (if available)
        const numMessages = Number(subfeed.getNumLocalMessages())
        const position = subfeedPosition(Math.max(0, numMessages - 1))
        const messages = subfeed.getLocalSignedMessages({position, numMessages: messageCount(1)})

        if (messages.length > 0) {
            return messages[messages.length - 1].body.message
        }
        else return null
    }
    async watchForNewMessages({
        subfeedWatches,
        waitMsec,
        maxNumMessages,
        signed
    }: {
        subfeedWatches: SubfeedWatchesRAM,
        waitMsec: DurationMsec,
        maxNumMessages: MessageCount,
        signed: boolean
    }): Promise<Map<SubfeedWatchName, (SubfeedMessage[] | SignedSubfeedMessage[])>> {
        // assert(typeof(waitMsec) === 'number');
        // assert(typeof(maxNumMessages) === 'number');

        const messages = new Map<SubfeedWatchName, SubfeedMessage[] | SignedSubfeedMessage[]>();

        // first check for messages we have locally and return those if nonempty...
        // if we have none of those, then we will wait for new messages (if waitMsec > 0)
        let foundSomething = false
        for (let wn of subfeedWatches.keys()) {
            const watchName = wn as any as SubfeedWatchName
            const w = subfeedWatches.get(watchName)
            if (!w) throw Error('Unexpected.')
            const subfeed = await this._loadSubfeed(w.feedId, w.subfeedHash)
            const numLocalMessages = subfeed.getNumLocalMessages()
            let numMessages = messageCountToNumber(numLocalMessages) - subfeedPositionToNumber(w.position)
            if ( numMessages > 0 ) {
                foundSomething = true
                if (messageCountToNumber(maxNumMessages) > 0) {
                    numMessages = Math.min(messageCountToNumber(maxNumMessages), numMessages)
                }
                let messages0 = subfeed.getLocalSignedMessages({position: w.position, numMessages: messageCount(numMessages) })
                if (signed) {
                    messages.set(watchName, messages0)
                }
                else {
                    messages.set(watchName, messages0.map(m => (m.body.message)))
                }
            }
        }
        if (foundSomething) {
            return messages
        }
        if (durationMsecToNumber(waitMsec) === 0) {
            // we are not going to wait
            return messages
        }

        // now we are going to wait
        return new Promise<Map<SubfeedWatchName, (SubfeedMessage[] | SignedSubfeedMessage[])>>((resolve, reject) => {
            // Wait until new messages are received on one or more subfeeds, and return information on which watches were triggered

            let finished = false;

            let numMessages = 0;
            const doFinish = async () => {
                if (finished) return;
                if (numMessages > 0) {
                    // maybe we have other messages coming in at exactly the same time. Wait a bit for those
                    await sleepMsec(scaledDurationMsec(30));
                }
                finished = true;
                resolve(messages);
            }

            subfeedWatches.forEach((w: SubfeedWatch, watchName: SubfeedWatchName) => {
                messages.set(watchName, [])
            })
            subfeedWatches.forEach((w: SubfeedWatch, watchName: SubfeedWatchName) => {
                this._loadSubfeed(w.feedId, w.subfeedHash).then((subfeed) => {
                    if (subfeed) {
                        subfeed.waitForSignedMessages({position: w.position, maxNumMessages, waitMsec}).then((messages0) => {
                            if (messages0.length > 0) {
                                if (signed) {
                                    messages.set(watchName, messages0)
                                }
                                else {
                                    messages.set(watchName, messages0.map(m => m.body.message))
                                }
                                numMessages += messages0.length;
                                if (!finished) doFinish();
                            }
                        });
                    }
                })
            })

            setTimeout(() => {
                if (!finished) doFinish();
            }, durationMsecToNumber(waitMsec));
        });
    }
    async createOrRenewIncomingSubfeedSubscription(channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, position: SubfeedPosition) {
        if (!(await this.hasWriteableFeed(feedId))) return
        const subfeed = await this._loadSubfeed(feedId, subfeedHash)
        if (!subfeed.isWriteable()) {
            throw Error('Cannot have an incoming subscription to a subfeed that is not writeable')
        }
        this.#incomingSubfeedSubscriptionManager.createOrRenewIncomingSubscription(channelName, feedId, subfeedHash)
        if (Number(position) < Number(subfeed.getNumLocalMessages())) {
            await this._uploadSubfeedMessagesToChannel(channelName, feedId, subfeedHash)
            await this._reportSubfeedUpdateToChannel(channelName, feedId, subfeedHash, subfeed.getNumLocalMessages())
        }
    }
    async reportSubfeedMessageCountUpdate(channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, messageCount: MessageCount) {
        if (this.#outgoingSubfeedSubscriptionManager.hasSubfeedSubscription(feedId, subfeedHash)) {
            const subfeed = await this._loadSubfeed(feedId, subfeedHash)
            subfeed.reportNumRemoteMessages(channelName, messageCount)
        }
    }
    async reportNumRemoteMessages(channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, numRemoteMessages: MessageCount) {
        const subfeed = await this._loadSubfeed(feedId, subfeedHash)
        subfeed.reportNumRemoteMessages(channelName, numRemoteMessages)
    }
    async _loadSubfeed(feedId: FeedId, subfeedHash: SubfeedHash): Promise<Subfeed> {
        // const timer = nowTimestamp()
        // Load a subfeed (Subfeed() instance

        // If we have already loaded it into memory, then do not reload
        const k = feedSubfeedId(feedId, subfeedHash)
        let subfeed = this.#subfeeds.get(k) || null

        if (subfeed) {
            await subfeed.waitUntilInitialized()
        }
        else {
            // Instantiate and initialize the subfeed
            subfeed = new Subfeed(this.kacheryHubInterface, feedId, subfeedHash, this.localFeedManager)
            subfeed.onMessagesAdded(() => {
                if (!subfeed) throw Error('Unexpected')
                this._uploadSubfeedMessagesToSubscribedChannels(feedId, subfeedHash)
            })
            subfeed.onSubscribeToRemoteSubfeed((feedId: FeedId, subfeedHash: SubfeedHash, position: SubfeedPosition) => {
                this.#outgoingSubfeedSubscriptionManager.createOrRenewOutgoingSubscription(feedId, subfeedHash, position)
            })
            // Store in memory for future access (the order is important here, see waitUntilInitialized above)
            this.#subfeeds.set(k, subfeed)

            // Load private key if this is writeable (otherwise, privateKey will be null)
            // important to do this after setting this.#subfeeds(k), because we need to await it
            const privateKey = await this.localFeedManager.getPrivateKeyForFeed(feedId)

            try {
                await subfeed.initialize(privateKey)
            }
            catch(err) {
                /* istanbul ignore next */
                this.#subfeeds.delete(k)
                /* istanbul ignore next */
                throw err
            }
        }
        
        // Return the subfeed instance
        return subfeed
    }
    async _uploadSubfeedMessagesToSubscribedChannels(feedId: FeedId, subfeedHash: SubfeedHash) {
        const channelNames = this.#incomingSubfeedSubscriptionManager.getChannelsSubscribingToSubfeed(feedId, subfeedHash)
        for (let channelName of channelNames) {
            await this._uploadSubfeedMessagesToChannel(channelName, feedId, subfeedHash)
        }
    }
    async _uploadSubfeedMessagesToChannel(channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash) {
        const subfeed = await this._loadSubfeed(feedId, subfeedHash)
        const subfeedJson = await this.kacheryHubInterface.loadSubfeedJson(channelName, feedId, subfeedHash)
        if (subfeedJson) {
            if (Number(subfeedJson.messageCount) >= Number(subfeed.getNumLocalMessages())) {
                return
            }
        }
        const i1 = Number(subfeedJson ? subfeedJson.messageCount : 0)
        const i2 = Number(subfeed.getNumLocalMessages())
        const signedMessages = subfeed.getLocalSignedMessages({position: subfeedPosition(i1), numMessages: messageCount(i2 - i1)})
        const uploadUrls = await this.kacheryHubInterface.createSignedSubfeedMessageUploadUrls({channelName, feedId, subfeedHash, messageNumberRange: [i1, i2]})
        for (let i = i1; i < i2; i++) {
            const uploadUrl = uploadUrls[i + '']
            const signedMessage = signedMessages[i - i1]
            const signedMessageContent = new TextEncoder().encode(JSON.stringify(signedMessage))
            const resp = await axios.put(uploadUrl.toString(), signedMessageContent, {
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Length': signedMessageContent.length
                },
                maxBodyLength: Infinity, // apparently this is important
                maxContentLength: Infinity // apparently this is important
            })
            if (resp.status !== 200) {
                throw Error(`Error in upload of subfeed message: ${resp.statusText}`)
            }
            this.nodeStats.reportBytesSent(byteCount(signedMessageContent.length), channelName)
        }

        {
            // not the best way to do this! (worried about race condition)
            // let's reload the subfeed.json in case it has changed
            // in future we should put a local lock, not sure
            const subfeedJson2 = await this.kacheryHubInterface.loadSubfeedJson(channelName, feedId, subfeedHash) || {
                messageCount: 0
            }
            if (Number(subfeedJson2.messageCount) < i2) {
                subfeedJson2.messageCount = messageCount(i2)
                const uploadUrl = uploadUrls['subfeedJson']
                const subfeedJsonContent = new TextEncoder().encode(JSON.stringify(subfeedJson2))
                const resp = await axios.put(uploadUrl.toString(), subfeedJsonContent, {
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Content-Length': subfeedJsonContent.length
                    },
                    maxBodyLength: Infinity, // apparently this is important
                    maxContentLength: Infinity // apparently this is important
                })
                if (resp.status !== 200) {
                    throw Error(`Error in upload of subfeed json: ${resp.statusText}`)
                }
                this.nodeStats.reportBytesSent(byteCount(subfeedJsonContent.length), channelName)
            }
        }

        this._reportSubfeedUpdateToChannel(channelName, feedId, subfeedHash, messageCount(i2))
    }
    async _reportSubfeedUpdateToChannel(channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, messageCount: MessageCount) {
        this.kacheryHubInterface.reportToChannelSubfeedMessagesAdded(
            channelName,
            feedId,
            subfeedHash,
            messageCount
        )
    }
}

// we use this interface to ensure consistency between the in-memory signed messages and the in-database signed messages (this is crucial for integrity of feed system)


// const _subfeedHash = (subfeedName) => {
//     if (typeof(subfeedName) == 'string') {
//         if (subfeedName.startsWith('~')) {
//             assert(subfeedName.length === 41, `Invalid subfeed name: ${subfeedName}`);
//             validateSha1Hash(subfeedName.slice(1));
//             return subfeedName.slice(1);
//         }
//         return sha1sum(subfeedName);
//     }
//     else {
//         return sha1sum(JSONStringifyDeterministic(subfeedName));
//     }
// }

export default FeedManager;
