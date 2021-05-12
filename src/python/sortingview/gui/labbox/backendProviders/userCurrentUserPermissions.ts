import { useEffect, useState } from 'react'
import { useBackendProviderClient } from './useBackendProviders'

const useCurrentUserPermissions = () => {
    const [, setUpdateCode] = useState<number>(0)
    const client = useBackendProviderClient()
    useEffect(() => {
        // only once per client
        client && client.onCurrentUserPermissionsChanged(() => {
            setUpdateCode(c => (c + 1))
        })
    }, [client])
    return client?.currentUserPermissions
}

export default useCurrentUserPermissions