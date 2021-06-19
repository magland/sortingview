import { useState } from "react"

// For debugging
const useCheckForChanges = (label: string, x: {[key: string]: any}) => {
    const [previous, setPrevious] = useState<{[key: string]: any} | null>(null)
    let somethingChanged = false
    if (previous) {
        for (let k in previous) {
            if (x[k] !== previous[k]) {
                somethingChanged = true
                console.info(`CHANGED: ${label}: ${k}`)
            }
        }
    }
    else {
        somethingChanged = true
    }
    if (somethingChanged) setPrevious(x)
}

export default useCheckForChanges