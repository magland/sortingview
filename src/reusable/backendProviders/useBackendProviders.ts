import { useContext } from "react"
import BackendProvidersContext from './BackendProvidersContext'

const useBackendProviders = () => {
    return useContext(BackendProvidersContext)
}

export const useBackendProviderClient = () => {
    return useBackendProviders().selectedBackendProviderClient
}

export default useBackendProviders