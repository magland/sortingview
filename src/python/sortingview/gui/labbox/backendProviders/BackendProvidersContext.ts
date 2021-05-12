import React from 'react'
import BackendProviderClient from './BackendProviderClient'

export type BackendProviderConfig = {
    uri: string
    label: string
    objectStorageUrl: string
}

export type BackendProvidersData = {
    selectedBackendProviderUri?: string
    selectedBackendProviderConfig?: BackendProviderConfig
    selectedBackendProviderClient?: BackendProviderClient
    selectBackendProvider: (uri: string) => void
}

const dummyComputeEngineInterface = {
    selectBackendProvider: (uri: string) => {}
}

const BackendProvidersContext = React.createContext<BackendProvidersData>(dummyComputeEngineInterface)

export default BackendProvidersContext