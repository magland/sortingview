import React from 'react'
import { FunctionComponent } from "react"
import { MuiThemeProvider } from '@material-ui/core';
import theme from './theme';
import { BrowserRouter } from 'react-router-dom';
import BackendProvidersContext from '../backendProviders/BackendProvidersContext';
import useSetupBackendProviders from '../backendProviders/useSetupBackendProviders';

const AppWrapper: FunctionComponent = (props) => {
    return (
        <MuiThemeProvider theme={theme}>
            <BrowserRouter>
                <InnerComponent {...props} />
            </BrowserRouter>
        </MuiThemeProvider>
    )
}

const InnerComponent: FunctionComponent = (props) => {
    const backendProvidersData = useSetupBackendProviders()
    return (
        <BackendProvidersContext.Provider value={backendProvidersData}>
            {props.children}
        </BackendProvidersContext.Provider>
    )
}

export default AppWrapper