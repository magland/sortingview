import { isNodeId } from "../../src/kachery-js/types/kacheryTypes"

const nodeId = process.env.REACT_APP_KACHERY_NODE_ID
if (!isNodeId(nodeId)) {
    throw Error(`Invalid node ID from KACHERY_NODE_ID env variable: ${nodeId}`)
}

const getNodeId = () => {
    return nodeId
}

export default getNodeId