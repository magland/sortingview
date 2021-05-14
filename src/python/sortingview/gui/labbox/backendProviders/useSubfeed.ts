import { useCallback, useEffect, useReducer, useRef } from "react"
import { FeedId, SubfeedHash, SubfeedMessage } from "../kacheryTypes"
import { useBackendProviderClient } from "./useBackendProviders"
import { SubfeedView } from './feeds/SubfeedManager'

type MessagesAction = {
    type: 'appendMessages'
    messages: SubfeedMessage[]
}

const messagesReducer = (state: SubfeedMessage[], action: MessagesAction) => {
    if (action.type === 'appendMessages') {
        return [...state, ...action.messages]
    }
    else return state
}

export const useSubfeed = (a: {feedId: FeedId | undefined, subfeedHash: SubfeedHash | undefined, tail?: boolean, onMessages?: (messages: SubfeedMessage[]) => void}) => {
    const { feedId, subfeedHash, onMessages } = a
    const client = useBackendProviderClient()
    const [messages, messagesDispatch] = useReducer(messagesReducer, [])
    const lastReportedMessageNumber = useRef<number>(-1)

    const tail = a.tail

    useEffect(() => {
        let subscription: SubfeedView | undefined = undefined
        if ((client) && (feedId) && (subfeedHash)) {
            subscription = client.subscribeToSubfeed({feedId, subfeedHash, downloadAllMessages: tail ? false : true, position: tail ? -1 : 0, onMessages: (msgs, messageNumber) => {
                messagesDispatch({type: 'appendMessages', messages: msgs})
            }})
        }
        return () => {
            subscription && subscription.cancel()
        }
    }, [client, feedId, subfeedHash, messagesDispatch, tail])

    const appendMessages = useCallback((messages: SubfeedMessage[]) => {
        if (!feedId) return
        if (!subfeedHash) return
        if (!client) return
        client.appendMessagesToSubfeed({feedId, subfeedHash, messages})
    }, [feedId, subfeedHash, client])

    useEffect(() => {
        if (!onMessages) return
        if (messages.length - 1 > lastReportedMessageNumber.current) {
            onMessages(messages.slice(lastReportedMessageNumber.current + 1, messages.length))
            lastReportedMessageNumber.current = messages.length - 1
        }
    }, [messages, onMessages, lastReportedMessageNumber])

    return {messages, appendMessages}
}

export default useSubfeed