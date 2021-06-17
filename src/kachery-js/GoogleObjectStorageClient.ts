import axios from "axios"
import NodeStats from "./NodeStats"
import { ChannelName, JSONValue, urlString } from "./types/kacheryTypes"
import cacheBust from "./util/cacheBust"

export type GoogleObjectStorageClientOpts = {
    bucketName: string
}

class GoogleObjectStorageClient {
    constructor(private opts: GoogleObjectStorageClientOpts) {
    }
    async getObjectData(name: string, opts: {cacheBust?: boolean, nodeStats: NodeStats, channelName: ChannelName | null}): Promise<ArrayBuffer | null> {
        let url = urlString(`https://storage.googleapis.com/${this.opts.bucketName}/${name}`)
        if (opts.cacheBust) {
            url = cacheBust(url)
        }
        let resp = null
        try {
            resp = await axios.get(url.toString(), {responseType: 'arraybuffer'})
        }
        catch(err) {
            return null
        }
        if ((resp) && (resp.data)) {
            return resp.data
        }
        else return null
    }
    async getObjectJson(name: string, opts: {cacheBust?: boolean, nodeStats: NodeStats, channelName: ChannelName | null}): Promise<JSONValue | null> {
        const data = await this.getObjectData(name, opts)
        if (!data) return null
        let ret: JSONValue
        try {
            ret = JSON.parse(new TextDecoder().decode(data)) as any as JSONValue
        }
        catch(err) {
            console.warn(`Problem parsing JSON for object: ${name}`)
            return null
        }
        return ret
    }
}

export default GoogleObjectStorageClient
