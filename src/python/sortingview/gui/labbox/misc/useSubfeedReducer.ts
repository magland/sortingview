import{ useCallback, useReducer } from 'react'
import useSubfeed from '../backendProviders/useSubfeed'
import { FeedId, SubfeedHash, SubfeedMessage } from '../kacheryTypes'

const useSubfeedReducer = <State, Action>(feedId: FeedId | undefined, subfeedHash: SubfeedHash | undefined, reducer: (s: State, a: Action) => State, initialState: State, opts: {actionField: boolean}): [State, (a: Action) => void] => {
    const [state, dispatch2] = useReducer(reducer, initialState)
    const handleMessages = useCallback((messages: SubfeedMessage[]) => {
        for (let msg of messages) {
            if (opts.actionField) {
                const action = msg.action
                if (action) {
                    dispatch2(action as any as Action)
                }
            }
            else {
                dispatch2(msg as any as Action)
            }
        }
    }, [opts.actionField])
    const {appendMessages} = useSubfeed({feedId, subfeedHash, onMessages: handleMessages})
    const dispatch = useCallback((action: Action) => {
        if (opts.actionField) {
            appendMessages([{action: action} as any as SubfeedMessage])
        }
        else {
            appendMessages([action as any as SubfeedMessage])
        }
    }, [appendMessages, opts.actionField])
    return [state, dispatch]
}

export default useSubfeedReducer