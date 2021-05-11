import React from 'react'
import { FunctionComponent } from "react"
import GoogleSignInContext from './GoogleSignInContext';
import useSetupGoogleSignIn from './useSetupGoogleSignIn';


const GoogleSignInSetup: FunctionComponent = (props) => {
    const googleSignInData = useSetupGoogleSignIn()
    return (
        <GoogleSignInContext.Provider value={googleSignInData}>
            {props.children}
        </GoogleSignInContext.Provider>
    )
}

export default GoogleSignInSetup