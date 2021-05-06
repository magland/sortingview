import axios from "axios"

export type HttpObjectStorageClientOpts = {
    baseUrl: string
}

class HttpObjectStorageClient {
    constructor(private opts: HttpObjectStorageClientOpts) {
    }
    async getObjectData(name: string): Promise<ArrayBuffer | null> {
        const url = `${this.opts.baseUrl}/${name}`
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

export default HttpObjectStorageClient