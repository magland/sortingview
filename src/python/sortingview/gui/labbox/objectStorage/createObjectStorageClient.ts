import HttpObjectStorageClient, {HttpObjectStorageClientOpts} from "./http/HttpObjectStorageClient"
import GoogleObjectStorageClient, { GoogleObjectStorageClientOpts } from "./google/GoogleObjectStorageClient"
import KacheryObjectStorageClient, { KacheryObjectStorageClientOpts } from "./kachery/KacheryObjectStorageClient"

export interface ObjectStorageClient {
    getObjectData: (name: string, opts?: {cacheBust?: boolean}) => Promise<ArrayBuffer | null>
}

const createObjectStorageClient = (opts: {google?: GoogleObjectStorageClientOpts, kachery?: KacheryObjectStorageClientOpts, http?: HttpObjectStorageClientOpts}): ObjectStorageClient => {
    if (opts.google) {
        return new GoogleObjectStorageClient(opts.google)
    }
    else if (opts.kachery) {
        return new KacheryObjectStorageClient(opts.kachery)
    }
    else if (opts.http) {
        return new HttpObjectStorageClient(opts.http)
    }
    else {
        throw Error('Invalid opts in createObjectStorageClient')
    }
}

export default createObjectStorageClient