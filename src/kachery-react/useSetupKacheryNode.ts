import axios from "axios"
import { useMemo } from "react"
import KacheryDaemonNode from "kachery-js/KacheryDaemonNode"
import { KacheryNodeRequestBody } from "kachery-js/types/kacheryNodeRequestTypes"
import { isJSONObject, isJSONValue, isNodeId, isSignature, nodeLabel, Signature, userId } from "kachery-js/types/kacheryTypes"
import { KacheryHubPubsubMessageBody } from "kachery-js/types/pubsubMessages"
import BrowserKacheryStorageManager from "./BrowserKacheryStorageManager"
import BrowserLocalFeedManager from "./BrowserLocalFeedManager"
import BrowserMutableManager from "./BrowserMutableManager"

const useSetupKacheryNode = (): KacheryDaemonNode => {
    // const {channel, setRoute} = useRoute()

    const kacheryNode = useMemo(() => {
        const nodeId = process.env.REACT_APP_KACHERY_NODE_ID
        if (!isNodeId(nodeId)) {
            throw Error(`Invalid node ID: ${nodeId}`)
        }
        const sendKacheryNodeRequest = async (requestBody: KacheryNodeRequestBody) => {
            const url = '/api/kacheryNodeRequest'
            const x = await axios.post(url, requestBody)
            const resp = x.data
            if (!isJSONValue(resp)) {
                console.warn(resp)
                throw Error('Problem in response to /api/kacheryNodeRequest')
            }
            return resp
        }
        const signPubsubMessage = async (messageBody: KacheryHubPubsubMessageBody): Promise<Signature> => {
            const url = '/api/signPubsubMessage'
            const x = await axios.post(url, messageBody)
            const resp = x.data
            if (!isJSONObject(resp)) {
                console.warn(resp)
                throw Error('Problem in response to /api/signPubsubMessage')
            }
            const signature = resp.signature
            if (!isSignature(signature)) {
                throw Error('Not a valid signature in response to /api/signPubsubMessage')
            }
            return signature
        }
        const label = nodeLabel('surfaceview3')
        const kacheryStorageManager = new BrowserKacheryStorageManager()
        const mutableManager = new BrowserMutableManager()
        const localFeedManager = new BrowserLocalFeedManager()
        const x = new KacheryDaemonNode({
            verbose: 0,
            nodeId,
            sendKacheryNodeRequest,
            signPubsubMessage,
            label,
            ownerId: userId('jmagland@flatironinstitute.org'),
            kacheryStorageManager,
            mutableManager,
            localFeedManager,
            opts: {
                kacheryHubUrl: 'https://kacheryhub.org',
                verifySubfeedMessageSignatures: false
            }
        })
        return x
    }, [])

    return kacheryNode
}

export default useSetupKacheryNode