import Ably from 'ably'
import { PubsubChannelName } from '../types/kacheryTypes'
import { PubsubChannel, PubsubMessage } from './createPubsubClient'

class AblyPubsubChannel {
    #ablyChannel: Ably.Types.RealtimeChannelCallbacks
    #messageBuffer: PubsubMessage[] = []
    #messageBufferSize: number = 0
    #sendMessageBufferScheduled = false
    constructor(ablyClient: Ably.Realtime, private channelName: PubsubChannelName, private opts: {}) {
        this.#ablyChannel = ablyClient.channels.get(this.channelName.toString())
    }
    subscribe(callback: (message: PubsubMessage) => void) {
        this.#ablyChannel.subscribe((x: any) => {
            const data0 = JSON.parse(new TextDecoder().decode(x.data))
            if (data0.messages) {
                for (let msg0 of data0.messages) {
                    callback({
                        data: msg0
                    })
                }
            }
            else {
                // in the future we can remove this case
                callback({
                    data: data0
                })
            }
        })
    }
    publish(message: PubsubMessage) {
        this._queueMessage(message)
    }
    _queueMessage(message: PubsubMessage) {
        const messageSize = JSON.stringify(message).length
        const maxSize = 10000
        if ((this.#messageBufferSize > 0) && (this.#messageBufferSize + messageSize > maxSize)) {
            this._sendMessageBuffer()
        }
        this.#messageBuffer.push(message)
        this.#messageBufferSize += messageSize
        this._scheduleSendMessageBuffer()
    }
    _sendMessageBuffer() {
        this.#sendMessageBufferScheduled = false
        if (this.#messageBuffer.length === 0) return
        const messages = this.#messageBuffer
        this.#messageBuffer = []
        this.#messageBufferSize = 0
        const toPublish = {messages: messages.map(m => (m.data))}
        this.#ablyChannel.publish({data: new TextEncoder().encode(JSON.stringify(toPublish))})
    }
    _scheduleSendMessageBuffer() {
        if (this.#sendMessageBufferScheduled) return
        this.#sendMessageBufferScheduled = true
        const timeoutMsec = 150
        setTimeout(() => {
            this._sendMessageBuffer()
        }, timeoutMsec)
    }
}

export type AblyAuthCallbackCallback = (error: Ably.Types.ErrorInfo | string, tokenRequestOrDetails: Ably.Types.TokenDetails | Ably.Types.TokenRequest | string) => void
export type AblyAuthCallback = (data: Ably.Types.TokenParams, callback: AblyAuthCallbackCallback) => void;

export type AblyPubsubClientOpts = {
    authCallback: AblyAuthCallback
}

class AblyPubsubClient {
    #ablyClient: Ably.Realtime
    constructor(private opts: AblyPubsubClientOpts) {
        this.#ablyClient = new Ably.Realtime({authCallback: opts.authCallback});
    }
    getChannel(channelName: PubsubChannelName): PubsubChannel {
        return new AblyPubsubChannel(this.#ablyClient, channelName, {})
    }
    unsubscribe() {
        this.#ablyClient.close()
    }
}

export default AblyPubsubClient