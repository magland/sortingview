import React, { useCallback, useEffect, useState } from 'react'
import { FunctionComponent } from "react"
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink'
import { GoogleSignIn, useGoogleSignInClient } from '../../labbox'
import { useSignedIn } from '../../labbox/googleSignIn/GoogleSignIn'
import hyperlinkStyle from './hyperlinkStyle'

type Props = {
}

const SignInSection: FunctionComponent<Props> = () => {

    const googleSignInClient = useGoogleSignInClient()
    const signedIn = useSignedIn()
    const [googleSignInVisible, setGoogleSignInVisible] = useState(false)
    const toggleGoogleSignInVisible = useCallback(() => {setGoogleSignInVisible(v => (!v))}, [])
    useEffect(() => {
        if ((signedIn) && (googleSignInVisible)) {
            // do this so that if we signed out, the big button will not be visible at first
            setGoogleSignInVisible(false)
        }
    }, [signedIn, googleSignInVisible])

    if (!googleSignInClient) return <span />
    return (
        <div className="SignInSection HomeSection">
            {
                signedIn ? (
                    <p>You are signed in as {googleSignInClient.profile?.getEmail()}</p>
                ) : (
                    <p>Some actions require authorization. You can optionally <Hyperlink style={hyperlinkStyle} onClick={toggleGoogleSignInVisible}>sign in using a Google account</Hyperlink>.</p>
                )
            }                        
            {
                // Display sign in button
                (!signedIn) && (googleSignInVisible) && <GoogleSignIn client={googleSignInClient} />
            }
            {
                // This will actually display a sign out button
                (signedIn) && <GoogleSignIn client={googleSignInClient} />
            }
        </div>
    )
}

export default SignInSection