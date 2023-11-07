import { getFileData, readDir } from "@figurl/interface"

const chunkSize = 1000 * 1000 * 4 // 4MB chunks. Is this a good choice?

type BinaryJson = {
    kwargs: {
        file_paths: string[]
        sampling_frequency: number
        num_chan: number
        dtype: '<i2'
        channel_ids: (number | string)[]
        time_axis: number
        file_offset: number
    }
}

type ProbeJson = {
    specification: 'probeinterface'
    version: string
    probes: {
        ndim: number
        si_units: string
        contact_positions: (number[])[]
        device_channel_indices: number[]
    }[]
}

export type EphysTracesInfo = {
    numChannels: number
    numFrames: number
    channelIds: (number | string)[]
    channelLocations: (number[])[]
    samplingFrequency: number
}

class EphysTracesClient {
    #chunks: {[chunkIndex: number]: ArrayBuffer} = {}
    #fetchingChunks = new Set<number>()
    #info: EphysTracesInfo | undefined
    #binaryJson: BinaryJson | undefined
    #probeJson: ProbeJson | undefined
    #binaryUri = ''
    #fileSize = 0
    #bytesPerEntry = 0
    #dataType = ''
    constructor(public format: string, private ephysTracesUri: string) {

    }
    async initialize() {
        const dir = await readDir(this.ephysTracesUri)
        const binaryJsonUri = `${this.ephysTracesUri}/binary.json`
        this.#binaryJson = await getFileData(binaryJsonUri, () => {}, {responseType: 'json'})
        if (!this.#binaryJson) throw Error('Unable to load binary.json')
        const probeJsonUri = `${this.ephysTracesUri}/probe.json`
        this.#probeJson = await getFileData(probeJsonUri, () => {}, {responseType: 'json'})
        if (!this.#probeJson) throw Error('Unable to load probe.json')
        const binaryFname = this.#binaryJson.kwargs.file_paths[0]
        const ff = dir.files.find(f => (f.name === binaryFname))
        if (!ff) {
            throw Error(`Unable to find: ${binaryFname} in remote directory`)
        }
        this.#dataType = this.#binaryJson.kwargs.dtype
        this.#bytesPerEntry = this.#dataType === '<i2' ? 2 : 2
        this.#fileSize = ff.size
        const channelIds = this.#binaryJson.kwargs.channel_ids
        this.#info = {
            channelIds,
            numChannels: channelIds.length,
            numFrames: this.#fileSize / (channelIds.length * this.#bytesPerEntry),
            samplingFrequency: this.#binaryJson.kwargs.sampling_frequency,
            channelLocations: this.#probeJson.probes[0].contact_positions
        }
        this.#binaryUri = `${this.ephysTracesUri}/${binaryFname}`
    }
    async getInfo() {
        await this.initialize()
        if (!this.#info) throw Error('unexpected')
        return this.#info
    }
    async getTraces(startFrame: number, endFrame: number): Promise<Int16Array[] | Float32Array[]> {
        const info = await this.getInfo()
        const buf = await this._fetchData(startFrame * info.numChannels * this.#bytesPerEntry, endFrame * info.numChannels * this.#bytesPerEntry)
        if (!buf) {
            throw Error('getTraces: Unable to get data from remote file')
        }
        if (this.#dataType === '<i2') {
            const aa = new Int16Array(buf)
            const bb: Int16Array[] = []
            for (let ich = 0; ich < info.numChannels; ich++) {
                const cc = new Int16Array(endFrame - startFrame)
                for (let it = 0; it < endFrame - startFrame; it++) {
                    cc[it] = aa[ich + it * info.numChannels]
                }
                bb.push(cc)
            }
            return bb
        }
        else {
            throw Error(`Unexpected data type: ${this.#dataType}`)
        }
    }
    async _fetchData(b1: number, b2: number): Promise<ArrayBuffer | undefined> {
        const i1 = Math.floor(b1 / chunkSize)
        const i2 = Math.floor(b2 / chunkSize)
        const pieces: ArrayBuffer[] = []
        for (let i = i1; i <= i2; i++) {
            let ch = await this._fetchChunk(i)
            if (!ch) return undefined
            if (i === i2) {
                ch = ch.slice(0, b2 - i * chunkSize)
            }
            if (i === i1) {
                ch = ch.slice(b1 - i * chunkSize)
            }
            pieces.push(ch)
        }
        // trigger getting the next chunk in advance (buffering)
        this._fetchChunk(i2 + 1)
        return concatenateArrayBuffers(pieces)
    }
    async _fetchChunk(i: number): Promise<ArrayBuffer | undefined> {
        if (this.#chunks[i]) return this.#chunks[i]
        if (i * chunkSize >= this.#fileSize) return undefined
        if (this.#fetchingChunks.has(i)) {
            while (this.#fetchingChunks.has(i)) {
                await sleepMsec(100)
            }
            return this.#chunks[i]
        }
        this.#fetchingChunks.add(i)
        try {
            const i1 = chunkSize * i
            const i2 = Math.min(chunkSize * (i + 1), this.#fileSize)
            const content = await getFileData(this.#binaryUri, () => {}, {startByte: i1, endByte: i2, responseType: 'binary'})
            this.#chunks[i] = content
            return this.#chunks[i]
        }
        catch(err) {
            console.error('Error fetching chunk', err)
            return undefined
        }
        finally {
            this.#fetchingChunks.delete(i)
        }
    }
}

export const concatenateArrayBuffers = (buffers: ArrayBuffer[]) => {
    if (buffers.length === 0) return new ArrayBuffer(0)
    if (buffers.length === 1) return buffers[0]
    const totalSize = buffers.reduce((prev, buffer) => (prev + buffer.byteLength), 0)
    const ret = new Uint8Array(totalSize)
    let pos = 0
    for (const buf of buffers) {
        ret.set(new Uint8Array(buf), pos)
        pos += buf.byteLength
    }
    return ret.buffer
}

async function sleepMsec(msec: number) {
    return new Promise(resolve => {
        setTimeout(resolve, msec)
    })
}

export default EphysTracesClient