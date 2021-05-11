import { createContext } from 'react';
import BasePlugin from './BasePlugin';

export class ExtensionContextImpl<Plugin extends BasePlugin> {
    plugins: Plugin[] = []
    registerPlugin(p: Plugin) {
        this.plugins.push(p)
    }
}

export const LabboxProviderContext = createContext<{
    plugins: BasePlugin[]
}>({
    plugins: [],
})