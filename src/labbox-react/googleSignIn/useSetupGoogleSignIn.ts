import { useCallback, useEffect, useMemo, useState } from 'react'
import GoogleSignInClient from './GoogleSignInClient'
import {GoogleSignInData} from './GoogleSignInContext'
import loadGoogleSignInClientOpts from './loadGoogleSignInClientOpts'

const useSetupGoogleSignIn = (): GoogleSignInData => {
    const opts = useMemo(() => (loadGoogleSignInClientOpts()), [])
    const [client, setClient] = useState<GoogleSignInClient | undefined>(undefined)
    const [updateCode, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => {setUpdateCode(c => (c+1))}, [])
    useEffect(() => {
        if (!opts) return
        const c = new GoogleSignInClient(opts)
        c.initialize().then(() => {
            c.onSignedInChanged(() => {
                // update the state if sign in has changed (although the client will remain the same)
                incrementUpdateCode()
            })
            setClient(c)
        })
    }, [opts, incrementUpdateCode])
    return useMemo(() => ({
        updateCode,
        client
    }), [client, updateCode])
}

export default useSetupGoogleSignIn