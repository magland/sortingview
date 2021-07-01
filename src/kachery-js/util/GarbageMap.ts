import { DurationMsec, durationMsecToNumber, elapsedSince, nowTimestamp, Timestamp } from '../types/kacheryTypes'

export default class GarbageMap<Key extends String, Value> {
    #map = new Map<Key, {value: Value, timestamp: Timestamp}>()
    #expirationTimeoutMsec: DurationMsec | null
    #lastCheckTimestamp = nowTimestamp()
    constructor(expirationTimeoutMSec: DurationMsec | null) {
        this.#expirationTimeoutMsec = expirationTimeoutMSec
    }
    get(key: Key): Value | undefined {
        this._checkGarbageCollection()
        const x = this.#map.get(key)
        if (x === undefined) {
            return undefined
        }
        else {
            return x.value
        }
    }
    getWithDefault(key: Key, defaultValue: Value): Value {
        this._checkGarbageCollection()
        const x = this.#map.get(key)
        if (x === undefined) {
            return defaultValue
        }
        else {
            return x.value
        }
    }
    set(key: Key, value: Value) {
        this.#map.set(key, {
            value,
            timestamp: nowTimestamp()
        })
        this._checkGarbageCollection()
    }
    delete(key: Key) {
        if (this.#map.has(key)) this.#map.delete(key)
        this._checkGarbageCollection()
    }
    has(key: Key) {
        return this.#map.has(key)
    }
    keys(): Key[] {
        return Array.from(this.#map.keys())
    }
    values(): Value[] {
        return Array.from(this.#map.values()).map(v => v.value)
    }
    clear() {
        this.#map.clear()
    }
    async _checkGarbageCollection() {
        const elapsedSinceCheck = elapsedSince(this.#lastCheckTimestamp)
        if (this.#expirationTimeoutMsec !== null) {
            if (elapsedSinceCheck > durationMsecToNumber(this.#expirationTimeoutMsec) / 2) {
                this.#lastCheckTimestamp = nowTimestamp()
                let keysToDelete: Key[] = [];
                this.#map.forEach((v, k) => {
                    const elapsed = elapsedSince(v.timestamp);
                    if (!this.#expirationTimeoutMsec) throw Error('Unexpected in _checkGarbageCollection')
                    if (elapsed > durationMsecToNumber(this.#expirationTimeoutMsec)) {
                        keysToDelete.push(k)
                    }
                })
                keysToDelete.forEach(k => {
                    this.#map.delete(k)
                })
            }
        }
    }
}