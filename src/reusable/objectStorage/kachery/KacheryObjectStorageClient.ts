// import KacheryDaemonInterface from "../../kacheryDaemonInterface/KacheryDaemonInterface"

export type KacheryObjectStorageClientOpts = {
    // kacheryDaemonInterface: KacheryDaemonInterface
}

class KacheryObjectStorageClient {
    constructor(private opts: KacheryObjectStorageClientOpts) {
    }
    async getObjectData(name: string) {
        return null
        // return await this.opts.kacheryDaemonInterface.getObjectData(name)
    }
}

export default KacheryObjectStorageClient