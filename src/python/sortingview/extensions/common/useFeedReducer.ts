import { useEffect, useMemo, useReducer, useRef } from "react"

export interface AppendOnlyLog {
    appendMessages: (messages: any[]) => void
    allMessages: () => any[]
    onMessages: (callback: (position: number, messages: any[]) => void) => void
}

export const dummyAppendOnlyLog = {
  appendMessages: (messages: any[]) => {},
  allMessages: () => ([]),
  onMessages: (callback: (position: number, messages: any[]) => void) => {}
}

export const useFeedReducer = <State, Action>(reducer: (s: State, a: Action) => State, initialState: State, subfeed: AppendOnlyLog | null): [State, (a: Action) => void] => {
    const [state, stateDispatch] = useReducer(reducer, initialState)
    const ref = useRef({messageCount: 0})
  
    useEffect(() => {
      if (subfeed) {
        // subfeed.allMessages().forEach(msg => {
        //   stateDispatch(msg)
        // })
        subfeed.onMessages((position, msgs) => {
          if (position < ref.current.messageCount) msgs = msgs.slice(ref.current.messageCount - position)
          if (msgs.length > 0) {
            msgs.forEach(msg => stateDispatch(msg))
            ref.current.messageCount += msgs.length
          }
        })
      }
    }, [subfeed])
  
    const newDispatch = useMemo(() => ((a: Action) => {
      if (subfeed) {
        subfeed.appendMessages([a])
      }
      else {
        stateDispatch(a)
      }
    }), [subfeed])
  
    return [state, newDispatch]
}