import { useEffect, useState } from 'react'
import { useBackendProviderClient } from './useBackendProviders'

const useBackendInfo = () => {
    const [, setUpdateCode] = useState<number>(0)
    const client = useBackendProviderClient()
    useEffect(() => {
        // only once per client
        client && client.onBackendInfoChanged(() => {
            setUpdateCode(c => (c + 1))
        })
    }, [client])
    return {
        backendPythonProjectVersion: client?.backendPythonProjectVersion
    }
}

export default useBackendInfo