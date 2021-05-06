import { Sha1Hash, pathifyHash, JSONValue } from "../kacheryTypes/kacheryTypes"
import { ObjectStorageClient } from "../../objectStorage/createObjectStorageClient"
import deserializeReturnValue from "./deserializeReturnValue"

const checkForTaskReturnValue = async (objectStorageClient: ObjectStorageClient, taskHash: Sha1Hash, opts: {deserialize: boolean}): Promise<JSONValue | null> => {
    const path = `task_results/${pathifyHash(taskHash)}`
    const returnValue = await objectStorageClient.getObjectData(path)
    if (!returnValue) return null
    let ret: JSONValue
    try {
        ret = JSON.parse(new TextDecoder().decode(returnValue)) as any as JSONValue
    }
    catch(err) {
        console.warn(`Problem parsing return value for: ${path}`, returnValue)
        return null
    }
    if (opts.deserialize) {
        try {
            ret = deserializeReturnValue(ret)
        }
        catch(err) {
            console.warn(`Problem deserializing return value for: ${path}`)
            return null
        }
    }
    return ret
}

export default checkForTaskReturnValue