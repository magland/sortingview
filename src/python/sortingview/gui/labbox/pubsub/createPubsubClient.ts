import { JSONObject } from "../kacheryTypes"
import AblyPubsubClient, {AblyPubsubClientOpts} from "./ably/AblyPubsubClient"
import KacheryPubsubClient, {KacheryPubsubClientOpts} from "./kachery/KacheryPubsubClient"

export interface PubsubMessage {
    data: JSONObject
}

export interface PubsubChannel {
    subscribe: (callback: (message: PubsubMessage) => void) => void
    publish: (message: PubsubMessage) => void
}

export interface PubsubClient {
    getChannel: (channelName: string) => PubsubChannel
}

const createPubsubClient = (opts: {ably?: AblyPubsubClientOpts, kachery?: KacheryPubsubClientOpts}): PubsubClient => {
    if (opts.ably) {
        return new AblyPubsubClient(opts.ably)
    }
    else if (opts.kachery) {
        return new KacheryPubsubClient(opts.kachery)
    }
    else {
        throw Error('Invalid opts in createPubsubClient')
    }
}


export default createPubsubClient