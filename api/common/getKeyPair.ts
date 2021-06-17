import { nodeIdToPublicKey } from "../../src/kachery-js/types/crypto_util"
import { isNodeId, isPrivateKey, KeyPair } from "../../src/kachery-js/types/kacheryTypes"

const nodeId = process.env.REACT_APP_KACHERY_NODE_ID
const privateKey = process.env.KACHERY_NODE_PRIVATE_KEY
if (!isNodeId(nodeId)) {
    throw Error(`Invalid node ID from KACHERY_NODE_ID env variable: ${nodeId}`)
}
if (!isPrivateKey(privateKey)) {
    throw Error(`Invalid private key from KACHERY_NODE_PRIVATE_KEY env variable: ${privateKey}`)
}
const keyPair: KeyPair = {
    publicKey: nodeIdToPublicKey(nodeId),
    privateKey
}

const getKeyPair = () => {
    return keyPair
}

export default getKeyPair