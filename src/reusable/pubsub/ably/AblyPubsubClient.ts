import Ably from 'ably'
import { PubsubMessage } from '../createPubsubClient'

class AblyPubsubChannel {
    #ablyChannel
    constructor(private ablyClient: Ably.Realtime, private channelName: string, private opts: {}) {
        this.#ablyChannel = ablyClient.channels.get(channelName)
    }
    subscribe(callback: (message: PubsubMessage) => void) {
        this.#ablyChannel.subscribe((x: any) => {
            const data0 = JSON.parse(new TextDecoder().decode(x.data))
            callback({
                data: data0
            })
        })
    }
    publish(message: PubsubMessage) {
        this.#ablyChannel.publish(message)
    }
}

export type AblyPubsubClientOpts = {
    token: string
}

class AblyPubsubClient {
    #ablyClient
    constructor(private opts: AblyPubsubClientOpts) {
        this.#ablyClient = new Ably.Realtime({token: opts.token});
    }
    getChannel(channelName: string) {
        return new AblyPubsubChannel(this.#ablyClient, channelName, {})
    }
}

export default AblyPubsubClient