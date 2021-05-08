import React, { useCallback, useEffect, useState } from 'react'
import { FunctionComponent } from "react";
import ReactGoogleButton from 'react-google-button'
import GoogleSignInClient from './GoogleSignInClient';

type Props = {
    client: GoogleSignInClient
}

export const useSignedIn = (signInClient: GoogleSignInClient) => {
    const [signedIn, setSignedIn] = useState<boolean>(signInClient.signedIn)
    useEffect(() => {
        signInClient.onSignedInChanged(() => {
            setSignedIn(signInClient.signedIn)
        })
    }, [signInClient])
    return signedIn
}

const GoogleSignin: FunctionComponent<Props> = ({client}) => {
    const [initialized, setInitialized] = useState<boolean>(false)
    const signedIn = useSignedIn(client)
    const gapi = client.gapi
    useEffect(() => {
        if (gapi === undefined) {
            client.initialize().finally(() => {
                setInitialized(true)
            })
        }
    }, [client, gapi])

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
                    (initialized) && (gapi) ? (
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

export default GoogleSignin