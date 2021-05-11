import { GoogleSignInClientOpts } from "./GoogleSignInClient"

const loadGoogleSignInClientOpts = (): GoogleSignInClientOpts | null => {
    // Client ID and API key from the Developer Console
    const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID
    const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY
    if (!GOOGLE_CLIENT_ID) {
        console.warn(`Environment variable not set: REACT_APP_GOOGLE_CLIENT_ID`)
    }
    if (!GOOGLE_API_KEY) {
        console.warn(`Environment variable not set: REACT_APP_GOOGLE_API_KEY`)
    }
    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    // const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.file';
    const GOOGLE_SCOPES = 'openid email'
    if (GOOGLE_CLIENT_ID && GOOGLE_API_KEY) {
        return {apiKey: GOOGLE_API_KEY, clientId: GOOGLE_CLIENT_ID, scopes: GOOGLE_SCOPES}
    }
    else return null
}

export default loadGoogleSignInClientOpts