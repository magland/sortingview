import React from 'react'
import { RegisteredBackendProvider } from './apiInterface'

export type BackendProviderConfig = {
    uri: string
    label: string
    objectStorageUrl: string
}

type BackendProviderClient = {}

export type BackendProvidersData = {
    registeredBackendProviders?: RegisteredBackendProvider[]
    selectedBackendProviderUri?: string
    selectedBackendProviderConfig?: BackendProviderConfig
    selectedBackendProviderClient?: BackendProviderClient
    refreshRegisteredBackendProviders: () => void
    selectBackendProvider: (uri: string) => void
}

const dummyComputeEngineInterface = {
    refreshRegisteredBackendProviders: () => {},
    selectBackendProvider: (uri: string) => {}
}

const BackendProvidersContext = React.createContext<BackendProvidersData>(dummyComputeEngineInterface)

export default BackendProvidersContext