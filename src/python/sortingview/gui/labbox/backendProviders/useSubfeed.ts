import { useCallback, useEffect, useReducer, useRef, useState } from "react"
import { FeedId, SubfeedHash, SubfeedMessage } from "../kacheryTypes"
import { useBackendProviderClient } from "./useBackendProviders"
import { SubfeedSubscription } from './feeds/SubfeedManager'

type MessagesAction = {
    type: 'appendMessages'
    messages: SubfeedMessage[]
    messageNumber: number
}

const messagesReducer = (state: SubfeedMessage[], action: MessagesAction) => {
    if (action.type === 'appendMessages') {
        const num = action.messageNumber
        if (num <= state.length) {
            return [...state, ...action.messages.slice(state.length - num)]
        }
        else return state
    }
    else return state
}

export const useSubfeedLastMessage = (a: {feedId: FeedId | undefined, subfeedHash: SubfeedHash | undefined, onMessages?: (messages: SubfeedMessage[]) => void}) => {
    const [lastMessage, setLastMessage] = useState<SubfeedMessage | undefined>(undefined)
    const { feedId, subfeedHash } = a
    const client = useBackendProviderClient()
    useEffect(() => {
        let subscription: SubfeedSubscription | undefined = undefined
        if ((client) && (feedId) && (subfeedHash)) {
            subscription = client.subscribeToSubfeed({feedId, subfeedHash, onMessages: (msgs, messageNumber) => {
                if (msgs.length > 0) {
                    setLastMessage(msgs[msgs.length - 1])
                }
            }})
        }
        return () => {
            subscription && subscription.cancel()
        }
    }, [client, feedId, subfeedHash])
    const appendMessage = useCallback((message: SubfeedMessage) => {
        if (!feedId) return
        if (!subfeedHash) return
        if (!client) return
        client.appendMessagesToSubfeed({feedId, subfeedHash, messages: [message]})
    }, [feedId, subfeedHash, client])
    return {lastMessage, appendMessage}
}

export const useSubfeed = (a: {feedId: FeedId | undefined, subfeedHash: SubfeedHash | undefined, onMessages?: (messages: SubfeedMessage[]) => void}) => {
    const { feedId, subfeedHash, onMessages } = a
    const client = useBackendProviderClient()
    const [messages, messagesDispatch] = useReducer(messagesReducer, [])
    const lastReportedMessageNumber = useRef<number>(-1)

    useEffect(() => {
        let subscription: SubfeedSubscription | undefined = undefined
        if ((client) && (feedId) && (subfeedHash)) {
            subscription = client.subscribeToSubfeed({feedId, subfeedHash, onMessages: (msgs, messageNumber) => {
                messagesDispatch({type: 'appendMessages', messages: msgs, messageNumber})
            }})
        }
        return () => {
            subscription && subscription.cancel()
        }
    }, [client, feedId, subfeedHash, messagesDispatch])

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
    
    // const { subfeedManager } = useContext(LabboxProviderContext)
    // const [messages, setMessages] = useState<any[]>([])
    // const [loadedInitialMessages, setLoadedInitialMessages] = useState<boolean>(false)
    // useEffect(() => {
    //     let lastMessageReportedIndex = 0
    //     const subfeed = new Subfeed(feedUri, subfeedName, subfeedManager)
    //     const reportMessages = () => {
    //         if (lastMessageReportedIndex < subfeed.messages.length) {
    //             if (onMessages) {
    //                 onMessages(subfeed.messages.slice(lastMessageReportedIndex))
    //             }
    //             lastMessageReportedIndex = subfeed.messages.length
    //         }
    //     }
    //     subfeed.onChange(() => {
    //         setMessages(subfeed.messages)
    //         setLoadedInitialMessages(subfeed.loadedInitialMessages)
    //         reportMessages()
    //     })
    //     setMessages(subfeed.messages)
    //     setLoadedInitialMessages(subfeed.loadedInitialMessages)
    //     reportMessages()
    //     return () => {
    //         subfeed.cleanup()
    //     }
    // }, [subfeedManager, feedUri, subfeedName, onMessages])
    // const appendMessages = useCallback(
    //     (messages: any[]) => {
    //         if ((feedUri !== undefined) && (subfeedName !== undefined)) subfeedManager?.appendMessages({feedUri, subfeedName, messages})
    //     },
    //     [feedUri, subfeedName, subfeedManager]
    // )
    // return {messages, loadedInitialMessages, appendMessages}
}

export default useSubfeed