import { useContext } from "react"
import FigurlContext from "./FigurlContext"

const useFigurlPlugins = () => {
    const context = useContext(FigurlContext)
    if (!context) throw Error('Figurl context is undefined. Use <FigurlSetup>.')
    return context.plugins
}

export default useFigurlPlugins