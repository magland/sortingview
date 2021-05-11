import React from 'react'
import { FunctionComponent } from "react"
import BackendProvidersContext from './BackendProvidersContext';
import useSetupBackendProviders from './useSetupBackendProviders';

const BackendProvidersSetup: FunctionComponent = (props) => {
    const backendProvidersData = useSetupBackendProviders()
    return (
        <BackendProvidersContext.Provider value={backendProvidersData}>
            {props.children}
        </BackendProvidersContext.Provider>
    )
}

export default BackendProvidersSetup