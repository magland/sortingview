import React, { useCallback, useEffect, useState } from 'react'
import { FunctionComponent } from "react";
import ReactGoogleButton from 'react-google-button'
import GoogleSignInClient from './GoogleSignInClient';
import useGoogleSignInClient from './useGoogleSignInClient';

type Props = {
    client: GoogleSignInClient
}

export const useSignedIn = () => {
    const signInClient = useGoogleSignInClient()
    const [, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => {setUpdateCode(c => (c+1))}, [])
    useEffect(() => {
        signInClient?.onSignedInChanged(() => {
            incrementUpdateCode()
        })
    }, [signInClient, incrementUpdateCode])
    return signInClient?.signedIn
}

const GoogleSignIn: FunctionComponent<Props> = ({client}) => {
    const signedIn = useSignedIn()
    const gapi = client.gapi

    const handleSignIn = useCallback(() => {
        gapi.auth2.getAuthInstance().signIn();
    }, [gapi])
    const handleSignOut = useCallback(() => {
        gapi.auth2.getAuthInstance().signOut()
    }, [gapi])

    return <div>
        {
            <span>
                {
                    (gapi) ? (
                        signedIn ? (
                            <span>
                                <button onClick={handleSignOut}>Sign out</button>
                            </span>
                        ) : (
                            <ReactGoogleButton onClick={handleSignIn} />
                        )
                    ) : gapi === undefined ? (
                        <div>Loading google api</div>
                    ) : (
                        <div>Unable to load google api</div>
                    )
                }
            </span>
        }
    </div>
}

export default GoogleSignIn