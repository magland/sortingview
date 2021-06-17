import axios from "axios"
import { UrlString } from "kachery-js/types/kacheryTypes"
import { randomAlphaString } from "../google/GoogleObjectStorageClient"

export type HttpObjectStorageClientOpts = {
    baseUrl: UrlString
}

class HttpObjectStorageClient {
    constructor(private opts: HttpObjectStorageClientOpts) {
    }
    async getObjectData(name: string, opts: {cacheBust?: boolean} = {}): Promise<ArrayBuffer | null> {
        let url = `${this.opts.baseUrl}/${name}`
        if (opts.cacheBust) {
            url = cacheBust(url)
        }
        let resp = null
        try {
            resp = await axios.get(url, {responseType: 'arraybuffer'})
        }
        catch(err) {
            return null
        }
        if ((resp) && (resp.data)) {
            return resp.data || null
        }
        else return null
    }
}

const cacheBust = (url: string) => {
    if (url.includes('?')) {
        return url + `&cb=${randomAlphaString(10)}`
    }
    else {
        return url + `?cb=${randomAlphaString(10)}`
    }
}

export default HttpObjectStorageClient