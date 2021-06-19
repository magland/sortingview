import { useContext } from "react"
import BasePlugin from "./BasePlugin"
import { ExtensionProviderContext } from "./ExtensionsSetup"

const usePlugins = <Plugin extends BasePlugin>() => {
    const { plugins } = useContext(ExtensionProviderContext)
    return plugins as any as Plugin[]
}

export default usePlugins