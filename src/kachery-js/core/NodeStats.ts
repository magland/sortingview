import GarbageMap from "../util/GarbageMap";
import { addByteCount, byteCount, ByteCount, ChannelName } from "../types/kacheryTypes";

// type BytesSentMethod = 'multicastUdp' | 'udp' | 'http' | 'webSocket'
// type BytesReceivedMethod = 'multicastUdp' | 'udp' | 'http' | 'webSocket'

export default class NodeStats {
    #bytesSent = byteCount(0)
    #bytesSentByChannel = new GarbageMap<ChannelName, ByteCount>(null)
    #bytesReceived = byteCount(0)
    #bytesReceivedByChannel = new GarbageMap<ChannelName, ByteCount>(null)
    #messagesSent: number = 0
    #messagesSentByChannel = new GarbageMap<ChannelName, number>(null)
    #messagesReceived: number = 0
    #messagesReceivedByChannel = new GarbageMap<ChannelName, number>(null)
    totalBytesSent() {
        return this.#bytesSent
    }
    totalBytesReceived() {
        return this.#bytesReceived
    }
    totalMessagesSent() {
        return this.#messagesSent
    }
    totalMessagesReceived() {
        return this.#messagesReceived
    }
    reportBytesSent(numBytes: ByteCount, channelName: ChannelName | null) {
        if (channelName) this.#bytesSentByChannel.set(channelName, addByteCount(this.#bytesSentByChannel.get(channelName) || byteCount(0), numBytes))
        this.#bytesSent = addByteCount(this.#bytesSent, numBytes)
    }
    reportBytesReceived(numBytes: ByteCount, channelName: ChannelName | null) {
        if (channelName) this.#bytesReceivedByChannel.set(channelName, addByteCount(this.#bytesReceivedByChannel.get(channelName) || byteCount(0), numBytes))
        this.#bytesReceived = addByteCount(this.#bytesReceived, numBytes)
    }
    reportMessagesSent(numMessages: number, channelName: ChannelName | null) {
        if (channelName) this.#messagesSentByChannel.set(channelName, (this.#messagesSentByChannel.get(channelName) || 0) + numMessages)
        this.#messagesSent = this.#messagesSent + numMessages
    }
    reportMessagesReceived(numMessages: number, channelName: ChannelName | null) {
        if (channelName) this.#messagesReceivedByChannel.set(channelName, (this.#messagesReceivedByChannel.get(channelName) || 0) + numMessages)
        this.#messagesReceived = this.#messagesReceived + numMessages
    }
}