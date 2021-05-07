import { useCallback, useEffect, useMemo, useState } from "react"
import createObjectStorageClient from "../objectStorage/createObjectStorageClient"
import createPubsubClient from "../pubsub/createPubsubClient"
import BackendProviderClient from "./BackendProviderClient"
import { BackendProviderConfig, BackendProvidersData } from "./BackendProvidersContext"
import axios from 'axios'
import { RegisteredBackendProvider, RegisterRequest, RegistrationResult } from "./apiInterface"
import { sleepMsec } from "./kacheryTypes/kacheryTypes"

const defaultBackendProviderUri = process.env.REACT_APP_DEFAULT_BACKEND_PROVIDER || undefined

const useSetupRegisteredBackendProviders = () => {
    const [registeredBackendProviders, setRegisteredBackendProviders] = useState<RegisteredBackendProvider[] | undefined>(undefined)

    const refreshRegisteredBackendProviders = useCallback(() => {
        ;(async () => {
            setRegisteredBackendProviders(undefined)
            await axios.post('/api/probeBackendProviders', {}, {responseType: 'json'})
            // give some time for backend providers to respond to probe
            await sleepMsec(2000)
            const r = await axios.post('/api/registeredBackendProviders', {}, {responseType: 'json'})
            if (r.data) {
                const d: RegisteredBackendProvider[] = r.data
                setRegisteredBackendProviders(d)
            }
        })()
    }, [])

    
    useEffect(() => {
        // called only once
        refreshRegisteredBackendProviders()
    }, [refreshRegisteredBackendProviders])

    return {registeredBackendProviders, refreshRegisteredBackendProviders}
}

const useSetupBackendProviders = (): BackendProvidersData => {
    const [selectedBackendProviderUri, setSelectedBackendProviderUri] = useState<string | undefined>(defaultBackendProviderUri)
    const {registeredBackendProviders, refreshRegisteredBackendProviders} = useSetupRegisteredBackendProviders()
    const [registration, setRegistration] = useState<RegistrationResult | null | undefined>(undefined)

    useEffect(() => {
        if ((selectedBackendProviderUri) && (registration === undefined)) {
            setRegistration(null)
            ;(async () => {
                const req0: RegisterRequest = {type: 'registerClient', backendProviderUri: selectedBackendProviderUri, appName: 'sortingview'}
                const registrationResult: RegistrationResult = (await axios.post('/api/register', req0)).data
                setRegistration(registrationResult || null)
            })()
        }
    }, [selectedBackendProviderUri, registration])

    const selectedBackendProviderConfig = useMemo((): BackendProviderConfig | undefined => (
        registration && selectedBackendProviderUri ? ({
            uri: selectedBackendProviderUri,
            label: registration.backendProviderConfig.label,
            objectStorageUrl: registration.backendProviderConfig.objectStorageUrl
        }) : undefined
    ), [registration, selectedBackendProviderUri])

    const selectedBackendProviderClient = useMemo(() => {
        if ((!registration) || (!selectedBackendProviderConfig)) return undefined
        const objectStorageClient = createObjectStorageClient({http: {baseUrl: selectedBackendProviderConfig.objectStorageUrl}})
        const ablyClient = createPubsubClient({ably: {token: registration.tokenDetails.token}})
        const clientChannel = ablyClient.getChannel(registration.clientChannelName)
        const serverChannel = ablyClient.getChannel(registration.serverChannelName)
        const X = new BackendProviderClient(clientChannel, serverChannel, objectStorageClient)
        return X
    }, [registration, selectedBackendProviderConfig])

    const selectBackendProvider = useCallback((uri: string) => {
        setSelectedBackendProviderUri(uri)
        setRegistration(undefined)
    }, [])
    
    return useMemo((): BackendProvidersData => ({
        registeredBackendProviders,
        selectedBackendProviderUri,
        selectedBackendProviderConfig,
        selectedBackendProviderClient,
        refreshRegisteredBackendProviders,
        selectBackendProvider
    }), [registeredBackendProviders, selectedBackendProviderUri, selectedBackendProviderConfig, selectedBackendProviderClient, refreshRegisteredBackendProviders, selectBackendProvider])
}

export default useSetupBackendProviders