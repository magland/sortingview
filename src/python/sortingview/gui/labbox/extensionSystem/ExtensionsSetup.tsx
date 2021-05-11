import React, { createContext, FunctionComponent, useMemo } from 'react';
import BasePlugin from './BasePlugin';

export class ExtensionContextImpl<Plugin extends BasePlugin> {
    plugins: Plugin[] = []
    registerPlugin(p: Plugin) {
        this.plugins.push(p)
    }
}

type Props = {
    children: React.ReactNode
    extensionContext: ExtensionContextImpl<any>
}

export const ExtensionProviderContext = createContext<{
    plugins: BasePlugin[]
}>({
    plugins: []
})

const ExtensionsSetup: FunctionComponent<Props> = ({ children, extensionContext }) => {
    const value = useMemo(() => ({
        plugins: extensionContext.plugins
    }), [extensionContext.plugins])
    return (
        <ExtensionProviderContext.Provider value={value}>
            {children}
        </ExtensionProviderContext.Provider>
    )
}

export default ExtensionsSetup