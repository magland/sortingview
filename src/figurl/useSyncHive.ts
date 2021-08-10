import { JSONStringifyDeterministic } from "kachery-js/types/kacheryTypes"
import { useCallback, useMemo, useState } from "react"

// The "sync hive" is where we keep track of the state that is synchronized between figures.

// Hive contains all the value/setValue pairs associated with sync IDs.
// There should be only one Hive instance per browser session.
// This is instantiated inside the useSyncHive() hook below.
class Hive {
    // all the value/setValue pairs associated with sync IDs
    #items: {[key: string]: {value: any, setValue: (a: any)=> void}} = {}
    // The constructor takes an onChange() callback
    constructor(private onChange: () => void) {
    }
    // get a value/setValue pair associated with a syncID
    get(syncId: string): {value: any, setValue: (a: any) => void} {
        if (!(syncId in this.#items)) {
            // if we don't already have this syncId we need to create it
            this.#items[syncId] = {
                value: undefined, // start out with undefined value (undefined never gets sync'd)
                setValue: (a: any) => { // the setValue function is created here once and for all
                    this._setValue(syncId, a)
                }
            }
            // since we have added a new record, we report that something has changed
            this.onChange()
        }
        // return the value/setValue pair (which may or may not be brand new)
        return this.#items[syncId]
    }
    _setValue(syncId: string, value: any) {
        // This is called internally
        // so we can assume that this.#items[syncId] is defined 
        const existingValue = this.#items[syncId].value
        const existingSetValue = this.#items[syncId].setValue
        if (_valuesMatch(existingValue, value)) {
            // if nothing is changing (value-wise), we don't do anything
            return
        }
        // set the updated value, and modify the reference to the pair object
        // but keep the setValue the same (it's important that the reference to setValue never changes)
        this.#items[syncId] = {
            value,
            setValue: existingSetValue
        }
        // Report that something has changed
        this.onChange()
    }
}

// A replaceSyncFunction is something that is supposed to recursively
// replace {_syncId: "..."} with {value: ..., setValue: ...}
// in some object
type ReplaceSyncFunction = (x: any) => any

// This is the react hook that provides the ReplaceSyncFunction
const useSyncHive = (): ReplaceSyncFunction => {
    // Incrementing the updateCode signals to react that something
    // has changed such that we need to redefine the replace sync function
    // which will in turn cause the synchronized states to be updated
    const [updateCode, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => {setUpdateCode(c => (c+1))}, [])
    
    // This is the singleton instance of the hive, keeping track of the value/setValue pairs
    const hive = useMemo(() => {
        const onChange = () => {
            incrementUpdateCode()
        }
        const X = new Hive(onChange)
        return X
    }, [incrementUpdateCode])

    // Here's where we define the replace sync function
    // it will be updated only when updateCode has been incremented
    const replaceSyncs = useCallback((x: any) => {
        if (updateCode < 0) console.warn('Never happens, but we need to reference updateCode here to keep the linter happy')
        
        // The replaceHelper is needed because we do a recursive replace
        const replaceHelper = (a: any): any => {
            if ((typeof(a) === 'object') && (a['_syncId'])) {
                // here's where we replace {_syncId: "..."} by {value: ..., setValue: ...}
                const syncId = a['_syncId']
                return hive.get(syncId)
            }
            else if ((typeof(a) === 'object') && (Array.isArray(a))) {
                // Recursively handle an array object
                const ret = []
                let somethingChanged = false
                for (let i = 0; i < a.length; i++) {
                    const newVal = replaceHelper(a[i])
                    if (a[i] !== newVal) somethingChanged = true
                    ret.push(newVal)
                }
                if (somethingChanged) return ret
                else return a
            }
            else if (typeof(a) === 'object') {
                // Recursively handle an object that is not an array
                const ret: {[key: string]: any} = {}
                let somethingChanged = false
                for (let k in a) {
                    const newVal = replaceHelper(a[k])
                    if (a[k] !== newVal) somethingChanged = true
                    ret[k] = newVal
                }
                if (somethingChanged) return ret
                else return a
            }
            else {
                // for everything else, we just return the value as-is
                return a
            }
        }

        return replaceHelper(x)
    }, [updateCode, hive])

    return replaceSyncs
}

// Returns true if a and b are equal as state values
// In other words, if a===b or stringify(a) === stringify(b)
// The former condition is needed for handling undefined which is
// not json stringify-able
const _valuesMatch = (a: any, b: any) => {
    if (a === b) return true // handles undefined = undefined, null = null
    try {
        return JSONStringifyDeterministic(a) === JSONStringifyDeterministic(b)
    }
    catch(err) {
        return false
    }
}

export default useSyncHive