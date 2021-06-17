import { JSONValue, PubsubChannelName } from "../types/kacheryTypes"
import AblyPubsubClient, { AblyAuthCallback } from "./AblyPubsubClient"

export interface PubsubMessage {
    data: JSONValue
}

export interface PubsubChannel {
    subscribe: (callback: (message: PubsubMessage) => void) => void
    publish: (message: PubsubMessage) => void
}

export interface PubsubClient {
    getChannel: (channelName: PubsubChannelName) => PubsubChannel
    unsubscribe: () => void
}

type AblyPubsubClientOpts = {
    ablyAuthCallback: AblyAuthCallback
}

const createPubsubClient = (opts: {ably?: AblyPubsubClientOpts}): PubsubClient => {
    if (opts.ably) {
        return new AblyPubsubClient({authCallback: opts.ably.ablyAuthCallback})
    }
    else {
        throw Error('Invalid opts in createPubsubClient')
    }
}


export default createPubsubClient