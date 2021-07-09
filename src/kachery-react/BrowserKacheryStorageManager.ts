import { NodeStats, DataStreamy } from "kachery-js";
import { byteCount, ByteCount, ChannelName, FileKey, localFilePath, LocalFilePath, Sha1Hash, UrlString } from "kachery-js/types/kacheryTypes";

class BrowserKacheryStorageManager {
    async hasLocalFile(fileKey: FileKey) : Promise<boolean> {
        return false
    }
    async findFile(fileKey: FileKey) : Promise<{found: boolean, size: ByteCount, localFilePath: LocalFilePath | null}> {
        return {found: false, size: byteCount(0), localFilePath: null}
    }
    async getFileDataStreamy(fileKey: FileKey, startByte?: ByteCount, endByte?: ByteCount) : Promise<DataStreamy> {
        throw Error('not implemented')
    }
    async getFileReadStream(fileKey: FileKey, startByte?: ByteCount, endByte?: ByteCount) : Promise<{stream: any, size: ByteCount}> {
        throw Error('not implemented')
    }
    async storeFile(sha1: Sha1Hash, data: Buffer) : Promise<void> {
        throw Error('not implemented')
    }
    async storeLocalFile(localFilePath: LocalFilePath) : Promise<{sha1: Sha1Hash, manifestSha1: Sha1Hash | null}> {
        throw Error('not implemented')
    }
    async linkLocalFile(localFilePath: LocalFilePath, o: {size: number, mtime: number}) : Promise<{sha1: Sha1Hash, manifestSha1: Sha1Hash | null}> {
        throw Error('not implemented')
    }
    async storeFileFromStream(stream: DataStreamy, fileSize: ByteCount, o: {calculateHashOnly: boolean}) : Promise<{sha1: Sha1Hash, manifestSha1: Sha1Hash | null}> {
        throw Error('not implemented')
    }
    async storeFileFromBucketUrl(url: UrlString, o: {sha1: Sha1Hash, nodeStats: NodeStats, channelName: ChannelName | null}) : Promise<DataStreamy> {
        throw Error('not implemented')
    }
    async concatenateChunksAndStoreResult(sha1: Sha1Hash, chunkSha1s: Sha1Hash[]) : Promise<void> {
        throw Error('not implemented')
    }
    async moveFileToTrash(sha1: Sha1Hash) {
        throw Error('not implemented')
    }
    onFileStored(callback: (sha1: Sha1Hash) => void) {
        throw Error('not implemented')
    }
    storageDir() : LocalFilePath {
        return localFilePath('')
    }
}

export default BrowserKacheryStorageManager