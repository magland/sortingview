import { useContext } from "react"
import KacheryNodeContext from "./KacheryNodeContext"

const useKacheryNode = () => {
    const kacheryNode = useContext(KacheryNodeContext)
    if (!kacheryNode) throw Error('Kachery node is undefined. Use <KacheryNodeSetup>.')
    return kacheryNode
}

export default useKacheryNode