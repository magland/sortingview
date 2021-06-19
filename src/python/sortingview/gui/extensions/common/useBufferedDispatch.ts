import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const useBufferedDispatch = <State, Action>(reducer: (s: State, a: Action) => State, state: State, setState: (s: State) => void, t: number): [State, (a: Action) => void] => {
    const [count, setCount] = useState(0) // for triggering state changes (and re-calling this hook)
    if (count < 0) console.info(count) // just suppress the unused warning (will never print)
    const ref = useRef<{
        internalState: State,
        internalStateDispatched: boolean,
        internalStateHistory: {timestamp: number, state: State}[],
        // externalState: State,
        lastInternalDispatchTimestamp: number,
        // externalStateTimestamp: number,
        dispatchScheduled: boolean
        // updateInternalStateScheduled: boolean
    }>({
        internalState: state,
        internalStateDispatched: true,
        internalStateHistory: [],
        // externalState: state,
        lastInternalDispatchTimestamp: Number(new Date()),
        // externalStateTimestamp: Number(new Date()),
        dispatchScheduled: false
        // updateInternalStateScheduled: false
    })

    const update = useCallback(() => {
        if (!ref.current.internalStateDispatched) {
            // the internal state has not yet been dispatched to the external
            const now = Number(new Date())
            const elapsedSinceLastInternalDispatch = now - ref.current.lastInternalDispatchTimestamp
            if (elapsedSinceLastInternalDispatch > t) {
                // it's been long enough since the last internal action... dispatch to external
                setState(ref.current.internalState)
                ref.current.internalStateDispatched = true
            }
            else {
                // hasn't been long enough, schedule to return to update
                if (!ref.current.dispatchScheduled) {
                    ref.current.dispatchScheduled = true
                    setTimeout(() => {
                        ref.current.dispatchScheduled = false
                        update()
                    }, t - elapsedSinceLastInternalDispatch + 1)
                }
            }
        }
    }, [t, setState])

    useEffect(() => {
        if (state !== ref.current.internalState) {
            // the external state is not equal to the current internal state. Let's see if it is in the history
            if (ref.current.internalStateHistory.filter(x => (x.state === state)).length > 0) {
                // it's in the history, so ignore it
                return
            }
            // not in the history...
            ref.current.internalState = state
            ref.current.internalStateHistory.push({state, timestamp: Number(new Date())})
            const now = Number(new Date())
            ref.current.internalStateHistory = ref.current.internalStateHistory.filter(x => (now - x.timestamp < 10000))
            setCount((c) => (c + 1)) // triggers state change and calling this hook again to return the new internal state
        }
    }, [state, update])

    const newState = ref.current.internalState
    const newDispatch = useMemo(() => ((a: Action) => {
        const newInternalState = reducer(ref.current.internalState, a)
        if (newInternalState !== ref.current.internalState) {
            ref.current.internalState = newInternalState
            ref.current.internalStateHistory.push({timestamp: Number(new Date()), state: newInternalState})
            const now = Number(new Date())
            ref.current.internalStateHistory = ref.current.internalStateHistory.filter(x => (now - x.timestamp < 10000))
            ref.current.lastInternalDispatchTimestamp = Number(new Date())
            ref.current.internalStateDispatched = false
            update()
            setCount((c) => (c + 1)) // triggers state change and calling this hook again to return the new internal state
        }
    }), [reducer, update])

    return [newState, newDispatch]
}

export default useBufferedDispatch