import { MutableRecord } from "kachery-js/ExternalInterface"
import { JSONValue } from "kachery-js/types/kacheryTypes"

class BrowserMutableManager {
    async set(key: JSONValue, value: JSONValue) : Promise<void> {
        throw Error('not-implemented')
    }
    async get(key: JSONValue) : Promise<MutableRecord | undefined> {
        return undefined
    }
    async delete(key: JSONValue) : Promise<void> {
        throw Error('not-implemented')
    }
    onSet(callback: (key: JSONValue) => void) : void {
        //
    }
}

export default BrowserMutableManager