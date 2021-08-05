import axios from "axios"
import { KacheryNode } from "kachery-js"
import { KacheryNodeRequestBody } from "kachery-js/types/kacheryNodeRequestTypes"
import { isJSONObject, isJSONValue, isNodeId, isSignature, NodeLabel, Signature, userId } from "kachery-js/types/kacheryTypes"
import { KacheryHubPubsubMessageBody } from "kachery-js/types/pubsubMessages"
import { useMemo } from "react"
import BrowserKacheryStorageManager from "./BrowserKacheryStorageManager"
import BrowserLocalFeedManager from "./BrowserLocalFeedManager"
import BrowserMutableManager from "./BrowserMutableManager"

const useSetupKacheryNode = (nodeLabel: NodeLabel): KacheryNode => {
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
        const label = nodeLabel
        const kacheryStorageManager = new BrowserKacheryStorageManager()
        const mutableManager = new BrowserMutableManager()
        const localFeedManager = new BrowserLocalFeedManager()
        const x = new KacheryNode({
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
    }, [nodeLabel])

    return kacheryNode
}

export default useSetupKacheryNode