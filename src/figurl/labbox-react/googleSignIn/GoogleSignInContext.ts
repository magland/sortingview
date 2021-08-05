import React from 'react'
import GoogleSignInClient from './GoogleSignInClient'

export type GoogleSignInData = {
    client?: GoogleSignInClient
}

const dummyGoogleSignInData: GoogleSignInData = {}

const GoogleSignInContext = React.createContext<GoogleSignInData>(dummyGoogleSignInData)

export default GoogleSignInContext