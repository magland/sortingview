import Subfeed from 'kachery-js/feeds/Subfeed'
import { FeedId, JSONStringifyDeterministic, SubfeedHash, SubfeedMessage } from 'kachery-js/types/kacheryTypes'
import { useEffect, useMemo, useState } from 'react'
import useSubfeed from './useSubfeed'

type CompositeState<State> = {
    feedId: FeedId,
    subfeedHash: SubfeedHash,
    initialStateString: string
    numMessages: number
    state: State
}

const useSubfeedReducer = <State, Action>(feedId: FeedId | undefined, subfeedHash: SubfeedHash | undefined, reducer: (s: State, a: Action) => State, initialState: State, opts: {actionField: boolean}): {state: State, subfeed: Subfeed | undefined} => {
    const [compositeState, setCompositeState] = useState<CompositeState<State> | undefined>(undefined)

    const {messages: messages2, subfeed} = useSubfeed({feedId, subfeedHash})

    const messages: SubfeedMessage[] | undefined = useMemo(() => {
        if (!messages2) return undefined
        if (opts.actionField) {
            return messages2.map((m: any) => (m.action)).filter((a: any) => (a !== undefined)) as SubfeedMessage[]
        }
        else return messages2
    }, [messages2, opts.actionField])

    const initialStateString = JSONStringifyDeterministic(initialState)

    useEffect(() => {
        if ((!feedId) || (!subfeedHash) || (!messages)) {
            if (compositeState) {
                setCompositeState(undefined)
            }
            return
        }
        if ((compositeState) && ((compositeState.feedId !== feedId) || (compositeState.subfeedHash !== subfeedHash) || (compositeState.initialStateString !== initialStateString))) {
            setCompositeState(undefined)
            return
        }
        if (!compositeState) {
            setCompositeState({
                feedId,
                subfeedHash,
                initialStateString,
                numMessages: messages.length,
                state: messages.reduce<State>((previousState, msg) => reducer(previousState, msg as any as Action), JSON.parse(initialStateString))
            })
            return
        }
        if ((messages) && (messages.length > compositeState.numMessages)) {
            setCompositeState({
                feedId,
                subfeedHash,
                initialStateString,
                numMessages: messages.length,
                state: messages.slice(compositeState.numMessages).reduce<State>((previousState, msg) => reducer(previousState, msg as any as Action), compositeState.state)
            })
        }
    }, [feedId, subfeedHash, compositeState, messages, initialStateString, reducer])

    const state = useMemo(() => {
        return compositeState ? compositeState.state : JSON.parse(initialStateString)
    }, [compositeState, initialStateString])

    return {state, subfeed}
}

export default useSubfeedReducer