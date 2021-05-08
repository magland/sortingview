import React from 'react'
import GoogleSignin from './GoogleSignin'

export type GoogleSignInClientOpts = {
    clientId: string
    apiKey: string
    scopes: string
}

class GoogleSignInClient {
    #gapi: any | undefined | null = undefined
    #signedIn: boolean = false
    #onSignedInCallbacks: ((val: boolean) => void)[] = []
    constructor(private opts: GoogleSignInClientOpts) {

    }
    public get signedIn() {
        return this.#signedIn
    }
    public get gapi() {
        return this.#gapi
    }
    public get signInButton(): any {
        return React.createElement(GoogleSignin, {client: this})
    }
    onSignedInChanged(callback: (val: boolean) => void) {
        this.#onSignedInCallbacks.push(callback)
    }
    async initialize() {
        if (this.#gapi) return
        return new Promise<void>((resolve, reject) => {
            const g = (window as any).gapi
            g.load('client:auth2', () => {
                // Array of API discovery doc URLs for APIs used by the quickstart
                const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

                g.client.init({
                    apiKey: this.opts.apiKey,
                    clientId: this.opts.clientId,
                    discoveryDocs: DISCOVERY_DOCS,
                    scope: this.opts.scopes
                }).then(() => {
                    // Listen for sign-in state changes.
                    g.auth2.getAuthInstance().isSignedIn.listen(() => {
                        this._setSignedIn(g.auth2.getAuthInstance().isSignedIn.get())
                    });
                    this.#gapi = g
                    this._setSignedIn(g.auth2.getAuthInstance().isSignedIn.get())
                    resolve()
                }).catch((error: Error) => {
                    this.#gapi = null
                    reject(error)
                });
            });
        })   
    }
    _setSignedIn(val: boolean) {
        if (this.#signedIn === val) return
        this.#signedIn = val
        for (let cb of this.#onSignedInCallbacks) {
            cb(val)
        }
    }
}

export default GoogleSignInClient