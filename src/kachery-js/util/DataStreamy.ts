import { byteCount, ByteCount, byteCountToNumber } from "../types/kacheryTypes"

export interface DataStreamyProgress {
    bytesLoaded: ByteCount
    bytesTotal: ByteCount
}

class DataStreamyProducer {
    #cancelled = false
    #onCancelledCallbacks: (() => void)[] = []
    #lastUnorderedDataIndex: number = -1
    #unorderedDataChunksByIndex = new Map<number, Buffer>()
    #unorderedEndNumDataChunks: number | null = null
    constructor(private dataStream: DataStreamy) {
    }
    onCancelled(cb: () => void) {
        if (this.#cancelled) {
            cb()
        }
        this.#onCancelledCallbacks.push(cb)
    }
    isCancelled() {
        return this.#cancelled
    }
    error(err: Error) {
        if (this.#cancelled) return
        this.dataStream._producer_error(err)
    }
    start(size: ByteCount | null) {
        if (this.#cancelled) return
        this.dataStream._producer_start(size)
    }
    end() {
        if (this.#cancelled) return
        this.dataStream._producer_end()
    }
    data(buf: Buffer) {
        if (this.#cancelled) return
        // memoryLeakTest.push(buf)
        this.dataStream._producer_data(buf)
    }
    unorderedData(index: number, buf: Buffer) {
        this.#unorderedDataChunksByIndex.set(index, buf)
        while (this.#unorderedDataChunksByIndex.has(this.#lastUnorderedDataIndex + 1)) {
            this.#lastUnorderedDataIndex ++
            const buf = this.#unorderedDataChunksByIndex.get(this.#lastUnorderedDataIndex)
            /* istanbul ignore next */
            if (!buf) throw Error('Unexpected no buf in unorderedData')
            this.#unorderedDataChunksByIndex.delete(this.#lastUnorderedDataIndex)
            this.data(buf)
            if (this.#unorderedEndNumDataChunks !== null) {
                if (this.#lastUnorderedDataIndex === this.#unorderedEndNumDataChunks - 1) {
                    this.end()
                }
                else if (this.#lastUnorderedDataIndex > this.#unorderedEndNumDataChunks - 1) {
                    throw Error('Unexpected lastUnorderedDataIndex')
                }
            }
        }
    }
    unorderedEnd(numDataChunks: number) {
        if (this.#lastUnorderedDataIndex >= numDataChunks - 1) {
            this.end()
        }
        else {
            this.#unorderedEndNumDataChunks = numDataChunks
        }
    }
    incrementBytes(numBytes: ByteCount) {
        if (this.#cancelled) return
        this.dataStream._producer_incrementBytes(numBytes)
    }
    reportBytesLoaded(numBytes: ByteCount) {
        if (this.#cancelled) return
        this.dataStream._producer_reportBytesLoaded(numBytes)
    }
    setProgress(progress: DataStreamyProgress) {
        this.dataStream._producer_setProgress(progress)
    }
    _cancel() {
        if (this.#cancelled) return
        this.#cancelled = true
        this.#onCancelledCallbacks.forEach(cb => {cb()})
        this.dataStream._producer_error(Error('Cancelled'))
    }
}

export default class DataStreamy {
    #producer: DataStreamyProducer

    // state
    #completed = false
    #finished = false
    #started = false
    #size: ByteCount | null = null
    #bytesLoaded: ByteCount = byteCount(0)
    #error: Error | null = null
    #pendingDataChunks: Buffer[] = []

    // callbacks
    #onStartedCallbacks: ((size: ByteCount | null) => void)[] = []
    #onDataCallbacks: ((data: Buffer) => void)[] = []
    #onFinishedCallbacks: (() => void)[] = []
    #onCompleteCallbacks: (() => void)[] = []
    #onErrorCallbacks: ((err: Error) => void)[] = []
    #onProgressCallbacks: ((progress: DataStreamyProgress) => void)[] = []

    constructor() {
        this.#producer = new DataStreamyProducer(this)
    }
    onStarted(callback: ((size: ByteCount | null) => void)) {
        if (this.#started) {
            callback(this.#size)
        }
        this.#onStartedCallbacks.push(callback)
    }
    onData(callback: ((data: Buffer) => void)) {
        if ((this.#onDataCallbacks.length > 0) && (byteCountToNumber(this.#bytesLoaded) > 0)) {
            throw Error('onData already called in DataStreamy, and we have already received data')
        }
        this.#pendingDataChunks.forEach((ch: Buffer) => {
            callback(ch)
        })
        this.#pendingDataChunks = []
        this.#onDataCallbacks.push(callback)
    }
    async allData(): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const buffers: Buffer[] = []
            this.onData(buf => buffers.push(buf))
            this.onFinished(() => {
                resolve(Buffer.concat(buffers))
            })
            this.onError((err) => {
                reject(err)
            })
        })
    }
    onFinished(callback: (() => void)) {
        if (this.#finished) {
            // important to use setTimeout here because we want to get data before finished (if both are already available)
            setTimeout(() => {
                callback()
            }, 0)
        }
        this.#onFinishedCallbacks.push(callback)
    }
    onError(callback: ((err: Error) => void)) {
        if (this.#error) {
            // I think it is important to use setTimeout here
            setTimeout(() => {
                if (!this.#error) throw Error('error')
                callback(this.#error)
            }, 0)
        }
        this.#onErrorCallbacks.push(callback)
    }
    onProgress(callback: (progress: DataStreamyProgress) => void) {
        if ((byteCountToNumber(this.#bytesLoaded) > 0) && (this.#size)) {
            callback({bytesLoaded: this.#bytesLoaded, bytesTotal: this.#size})
        }
        this.#onProgressCallbacks.push(callback)
    }
    bytesLoaded(): ByteCount {
        return this.#bytesLoaded
    }
    bytesTotal(): ByteCount | null {
        return this.#size
    }
    cancel() {
        if (this.#completed) return
        this.#producer._cancel()
    }
    isComplete() {
        return this.#completed
    }
    producer() {
        return this.#producer
    }
    _producer_error(err: Error) {
        if (this.#completed) return
        this._handle_complete()
        this.#error = err
        this.#onErrorCallbacks.forEach(cb => {cb(err)})
    }
    _producer_start(size: ByteCount | null) {
        if (this.#completed) return
        if (this.#started) return
        this.#started = true
        this.#size = size
        this.#onStartedCallbacks.forEach(cb => {
            cb(size)
        })
    }
    _producer_end() {
        if (this.#completed) return
        this._handle_complete()
        this.#finished = true
        this.#onFinishedCallbacks.forEach(cb => {cb()})
    }
    _handle_complete() {
        this.#completed = true
        this.#onCompleteCallbacks.forEach(cb => {cb()})
        if (this.#pendingDataChunks.length > 0) {
            setTimeout(() => {
                this.#pendingDataChunks = []
            }, 1000)
        }
    }
    _producer_data(buf: Buffer) {
        if (this.#completed) return
        if (!this.#started) {
            this.#started = true
            this.#onStartedCallbacks.forEach(cb => {
                cb(null)
            })
        }
        this.#onDataCallbacks.forEach(cb => {
            cb(buf)
        })
        this._producer_incrementBytes(byteCount(buf.length))
        if (this.#onDataCallbacks.length === 0) {
            this.#pendingDataChunks.push(buf)
        }
    }
    _producer_incrementBytes(numBytes: ByteCount) {
        this._producer_reportBytesLoaded(byteCount(byteCountToNumber(this.#bytesLoaded) + byteCountToNumber(numBytes)))
    }
    _producer_reportBytesLoaded(numBytes: ByteCount) {
        this.#bytesLoaded = numBytes
        const s = this.#size
        if (s !== null) {
            this.#onProgressCallbacks.forEach(cb => {
                cb({bytesLoaded: this.#bytesLoaded, bytesTotal: s})
            })
        }
    }
    _producer_setProgress(progress: DataStreamyProgress) {
        this.#bytesLoaded = progress.bytesLoaded
        if (progress.bytesTotal) {
            this.#size = progress.bytesTotal
        }
        const s = this.#size
        if (s !== null) {
            this.#onProgressCallbacks.forEach(cb => {
                cb({bytesLoaded: this.#bytesLoaded, bytesTotal: s})
            })
        }
    }
}