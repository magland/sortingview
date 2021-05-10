import React from 'react'
import { FunctionComponent } from "react"
import { MuiThemeProvider } from '@material-ui/core';
import theme from './theme';
import { BrowserRouter } from 'react-router-dom';
import BackendProvidersContext from '../backendProviders/BackendProvidersContext';
import useSetupBackendProviders from '../backendProviders/useSetupBackendProviders';
import GoogleSignInContext from '../googleSignIn/GoogleSignInContext';
import useSetupGoogleSignIn from '../googleSignIn/useSetupGoogleSignIn';

const AppWrapper: FunctionComponent = (props) => {
    return (
        <MuiThemeProvider theme={theme}>
            <BrowserRouter>
                <InnerComponent1 {...props} />
            </BrowserRouter>
        </MuiThemeProvider>
    )
}

const InnerComponent1: FunctionComponent = (props) => {
    const googleSignInData = useSetupGoogleSignIn()
    return (
        <GoogleSignInContext.Provider value={googleSignInData}>
            <InnerComponent2 {...props} />
        </GoogleSignInContext.Provider>
    )
}

const InnerComponent2: FunctionComponent = (props) => {
    const backendProvidersData = useSetupBackendProviders()
    return (
        <BackendProvidersContext.Provider value={backendProvidersData}>
            {props.children}
        </BackendProvidersContext.Provider>
    )
}

export default AppWrapper