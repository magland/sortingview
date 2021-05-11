import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FunctionComponent } from "react";
import ReactGoogleButton from 'react-google-button'
import GoogleSignInClient from './GoogleSignInClient';
import useGoogleSignInClient from './useGoogleSignInClient';

type Props = {
    client: GoogleSignInClient
}

export const useSignedIn = () => {
    const signInClient = useGoogleSignInClient()
    const [updateCode, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => {setUpdateCode(c => (c+1))}, [])
    const signedIn = useMemo(() => {
        if (updateCode < 0) console.warn('Force dependency on update code')
        if (!signInClient) return false
        return signInClient.signedIn
    }, [signInClient, updateCode])
    useEffect(() => {
        signInClient?.onSignedInChanged(() => {
            incrementUpdateCode()
        })
    }, [signInClient, incrementUpdateCode])
    return signedIn
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