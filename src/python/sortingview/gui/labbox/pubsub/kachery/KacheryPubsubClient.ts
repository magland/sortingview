// import KacheryDaemonInterface from '../../kacheryDaemonInterface/KacheryDaemonInterface'
import { FeedId, sha1OfObject, subfeedHash } from '../../kacheryTypes'
import { PubsubMessage } from '../createPubsubClient'

class KacheryPubsubChannel {
    constructor(private opts: KacheryPubsubClientOpts, private channelName: string) {
        
    }
    subscribe(callback: (message: PubsubMessage) => void) {
        // this.opts.kacheryDaemonInterface.listenForMessages({feedId: this.opts.feedId, subfeedHash: this._subfeedHash()}, (data: JSONObject) => {
        //     callback({data})
        // })
    }
    publish(message: PubsubMessage) {
        // this.opts.kacheryDaemonInterface.appendMessages({feedId: this.opts.feedId, subfeedHash: this._subfeedHash(), messages: [message.data]})
    }
    _subfeedHash() {
        const subfeedKey = {channelName: this.channelName}
        return subfeedHash(sha1OfObject(subfeedKey))
    }
}

export type KacheryPubsubClientOpts = {
    //kacheryDaemonInterface: KacheryDaemonInterface
    feedId: FeedId
}

class KacheryPubsubClient {
    constructor(private opts: KacheryPubsubClientOpts) {
    }
    getChannel(channelName: string) {
        return new KacheryPubsubChannel(this.opts, channelName)
    }
}

export default KacheryPubsubClient