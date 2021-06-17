import { useEffect, useMemo, useState } from "react";
import Subfeed from "kachery-js/feeds/Subfeed";
import { FeedId, messageCount, SubfeedHash, SubfeedMessage, subfeedPosition, unscaledDurationMsec } from "kachery-js/types/kacheryTypes";
import useKacheryNode from "./useKacheryNode";
import { sleepMsecNum } from "kachery-js/util/util";

const useSubfeed = (args: {feedId: FeedId | undefined, subfeedHash: SubfeedHash | undefined}): {messages: SubfeedMessage[] | undefined, appendMessages: ((messages: SubfeedMessage[]) => void) | undefined} => {
    const {feedId, subfeedHash} = args
    const [messages, setMessages] = useState<SubfeedMessage[] | undefined>(undefined)
    const [subfeed, setSubfeed] = useState<Subfeed | undefined>(undefined)

    const kacheryNode = useKacheryNode()

    useEffect(() => {
        setMessages(undefined)
        setSubfeed(undefined)
        if (!feedId) return
        if (!subfeedHash) return
        let valid = true
        ;(async () => {
            const subfeed = await kacheryNode.feedManager()._loadSubfeed(feedId, subfeedHash)
            setSubfeed(subfeed)
            let internalPosition = 0
            while (valid) {
                const messages = await subfeed.waitForSignedMessages({position: subfeedPosition(internalPosition), maxNumMessages: messageCount(0), waitMsec: unscaledDurationMsec(10000)})
                if (!valid) return
                if (messages.length > 0) {
                    const localMessages = subfeed.getLocalMessages()
                    setMessages(localMessages)
                    internalPosition = localMessages.length
                }
                else {
                    await sleepMsecNum(100)
                }
            }
        })()
        return () => {
            valid = false
        }
    }, [feedId, subfeedHash, kacheryNode])

    const appendMessages = useMemo(() => {
        if (!feedId) return undefined
        if (!subfeedHash) return undefined
        if (!subfeed) return undefined
        if (!subfeed.isWriteable()) return undefined
        return (messages: SubfeedMessage[]) => {
            subfeed.appendMessages(messages, {metaData: {}}, {verifySignatures: false})
        }
    }, [feedId, subfeedHash, subfeed])

    return {messages, appendMessages}
}

export default useSubfeed