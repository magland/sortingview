import { useCallback, useEffect, useMemo, useState } from "react"
import createObjectStorageClient from "../objectStorage/createObjectStorageClient"
import createPubsubClient from "../pubsub/createPubsubClient"
import BackendProviderClient from "./BackendProviderClient"
import { BackendProviderConfig, BackendProvidersData } from "./BackendProvidersContext"
import axios from 'axios'
import { RegisterRequest, RegistrationResult } from "./apiInterface"
import useGoogleSignInClient from "../googleSignIn/useGoogleSignInClient"
import useRoute from "../../../../../route/useRoute"

// const defaultBackendProviderUri = process.env.REACT_APP_DEFAULT_BACKEND_PROVIDER || undefined

const useSetupBackendProviders = (): BackendProvidersData => {
    const {backendUri, setRoute} = useRoute()
    const [registration, setRegistration] = useState<RegistrationResult | null | undefined>(undefined)
    const googleSignInClient = useGoogleSignInClient()

    useEffect(() => {
        if ((backendUri) && (registration === undefined)) {
            setRegistration(null)
            ;(async () => {
                const req0: RegisterRequest = {type: 'registerClient', backendProviderUri: backendUri, appName: 'sortingview'}
                const registrationResult: RegistrationResult = (await axios.post('/api/register', req0)).data
                setRegistration(registrationResult || null)
            })()
        }
    }, [backendUri, registration])

    const selectedBackendProviderConfig = useMemo((): BackendProviderConfig | undefined => (
        registration && backendUri ? ({
            uri: backendUri,
            label: registration.backendProviderConfig.label,
            objectStorageUrl: registration.backendProviderConfig.objectStorageUrl
        }) : undefined
    ), [registration, backendUri])

    const selectedBackendProviderClient = useMemo(() => {
        if ((!backendUri) || (!registration) || (!selectedBackendProviderConfig)) return undefined
        const objectStorageClient = createObjectStorageClient({http: {baseUrl: selectedBackendProviderConfig.objectStorageUrl}})
        const ablyClient = createPubsubClient({ably: {token: registration.tokenDetails.token}})
        const clientChannel = ablyClient.getChannel(registration.clientChannelName)
        const serverChannel = ablyClient.getChannel(registration.serverChannelName)
        const X = new BackendProviderClient(backendUri, clientChannel, serverChannel, objectStorageClient, googleSignInClient)
        return X
    }, [backendUri, registration, selectedBackendProviderConfig, googleSignInClient])

    const selectBackendProvider = useCallback((uri: string) => {
        setRoute({backendUri: uri})
        setRegistration(undefined)
    }, [setRoute, setRegistration])
    
    return useMemo((): BackendProvidersData => ({
        selectedBackendProviderUri: backendUri,
        selectedBackendProviderConfig,
        selectedBackendProviderClient,
        selectBackendProvider
    }), [backendUri, selectedBackendProviderConfig, selectedBackendProviderClient, selectBackendProvider])
}

export default useSetupBackendProviders