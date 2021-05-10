import { useCallback, useEffect, useReducer, useRef } from "react"
import { FeedId, SubfeedHash, SubfeedMessage } from "./kacheryTypes/kacheryTypes"
import { useBackendProviderClient } from "./useBackendProviders"
import { SubfeedSubscription } from './feeds/SubfeedManager'

interface SubfeedManagerInterface {
    getMessages: (a: {feedUri: string, subfeedName: any, position: number, waitMsec: number}) => Promise<any[]>
    appendMessages: (a: {feedUri: string, subfeedName: any, messages: any[]}) => void
}

class Subfeed {
    messages: any[] = []
    loadedInitialMessages = false
    _changeCallbacks: (() => void)[] = []
    _active = false
    constructor(private feedUri: string | undefined, private subfeedName: any | undefined, private subfeedManager: SubfeedManagerInterface | undefined) {
        this._active = true
        this._start()
    }
    onChange(callback: () => void) {
        this._changeCallbacks.push(callback)
    }
    cleanup() {
        this._active = false
    }
    async _start() {
        if ((this.feedUri === undefined) || (this.subfeedName === undefined)) return
        while (this._active) {
            if (this.subfeedManager) {
                const msgs = await this.subfeedManager.getMessages({feedUri: this.feedUri, subfeedName: this.subfeedName, position: this.messages.length, waitMsec: 12000})
                if (msgs.length > 0) {
                    this.messages = [...this.messages, ...msgs]
                    this.loadedInitialMessages = true
                    this._changeCallbacks.forEach(cb => cb())
                }
                else {
                    if (!this.loadedInitialMessages) {
                        this.loadedInitialMessages = true
                        this._changeCallbacks.forEach(cb => cb())
                    }
                }
            }
            await sleepMsec(100)
        }
    }
}

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

export const useSubfeed = (a: {feedId: FeedId | undefined, subfeedHash: SubfeedHash | undefined, onMessages?: (messages: SubfeedMessage[]) => void}) => {
    const { feedId, subfeedHash, onMessages } = a
    const client = useBackendProviderClient()
    const [messages, messagesDispatch] = useReducer(messagesReducer, [])
    const lastReportedMessageNumber = useRef<number>(-1)

    useEffect(() => {
        let subscription: SubfeedSubscription | undefined = undefined
        if ((client) && (feedId) && (subfeedHash)) {
            subscription = client.subscribeToSubfeed({feedId, subfeedHash, startPosition: 0, onMessages: (msgs, messageNumber) => {
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

const sleepMsec = (m: number) => new Promise(r => setTimeout(r, m));

export default useSubfeed