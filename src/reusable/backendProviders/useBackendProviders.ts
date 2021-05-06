import { useContext } from "react"
import BackendProvidersContext from './BackendProvidersContext'

const useBackendProviders = () => {
    return useContext(BackendProvidersContext)
}

export default useBackendProviders