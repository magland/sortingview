import { useEffect, useMemo, useState } from 'react'
import GoogleSignInClient from './GoogleSignInClient'
import {GoogleSignInData} from './GoogleSignInContext'
import loadGoogleSignInClientOpts from './loadGoogleSignInClientOpts'

const useSetupGoogleSignIn = (): GoogleSignInData => {
    const opts = useMemo(() => (loadGoogleSignInClientOpts()), [])
    const [client, setClient] = useState<GoogleSignInClient | undefined>(undefined)
    useEffect(() => {
        if (!opts) return
        const c = new GoogleSignInClient(opts)
        c.initialize().then(() => {
            setClient(c)
        })
    }, [opts])
    return {
        client
    }
}

export default useSetupGoogleSignIn