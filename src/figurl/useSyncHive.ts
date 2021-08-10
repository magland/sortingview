import { JSONStringifyDeterministic } from "kachery-js/types/kacheryTypes"
import { useCallback, useMemo, useState } from "react"

const _valuesMatch = (a: any, b: any) => {
    if (a === b) return true // handles undefined = undefined, null = null
    try {
        return JSONStringifyDeterministic(a) === JSONStringifyDeterministic(b)
    }
    catch(err) {
        return false
    }
}

class Hive {
    #items: {[key: string]: {value: any, setValue: (a: any)=> void}} = {}
    constructor(private onChange: () => void) {

    }
    get(syncId: string): {value: any, setValue: (a: any) => void} {
        if (!(syncId in this.#items)) {
            this.#items[syncId] = {
                value: undefined,
                setValue: (a: any) => {
                    this._setValue(syncId, a)
                }
            }
            this.onChange()
        }
        return this.#items[syncId]
    }
    _setValue(syncId: string, value: any) {
        const existingValue = this.#items[syncId].value
        const existingSetValue = this.#items[syncId].setValue
        if (_valuesMatch(existingValue, value)) return
        this.#items[syncId] = {
            value,
            setValue: existingSetValue
        }
        this.onChange()
    }
}

const useSyncHive = () => {
    const [updateCode, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => {setUpdateCode(c => (c+1))}, [])
    const hive = useMemo(() => {
        const onChange = () => {
            incrementUpdateCode()
        }
        const X = new Hive(onChange)
        return X
    }, [incrementUpdateCode])

    const replaceSyncs = useCallback((x: any) => {
        if (updateCode < 0) console.warn('Never happens, but we need to reference updateCode here')
        const replaceHelper = (a: any): any => {
            if ((typeof(a) === 'object') && (a['_syncId'])) {
                const syncId = a['_syncId']
                return hive.get(syncId)
            }
            else if ((typeof(a) === 'object') && (Array.isArray(a))) {
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
            else return a
        }
        return replaceHelper(x)
    }, [updateCode, hive])

    return replaceSyncs
}

export default useSyncHive