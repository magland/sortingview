import { VercelRequest, VercelResponse } from '@vercel/node'
import Ably from 'ably'
import axios from 'axios'
import { isRegisterRequest, RegistrationResult } from './apiInterface'
import { sha1OfString } from './common/misc'

const requestAblyToken = async (opts: {ablyRestClient: Ably.Rest, capability: any}) => {
    return new Promise<Ably.Types.TokenDetails>((resolve, reject) => {
        opts.ablyRestClient.auth.requestToken({
            capability: JSON.stringify(opts.capability)
        }, (err, result) => {
            if (err) {
                reject(err)
                return
            }
            if (!result) throw Error('Unexpected')
            resolve(result)
        })
    })
}

const cacheBust = (url: string) => {
    if (url.includes('?')) {
        return url + `&cb=${randomAlphaString(10)}`
    }
    else {
        return url + `?cb=${randomAlphaString(10)}`
    }
}

export const randomAlphaString = (num_chars: number) => {
    if (!num_chars) {
        /* istanbul ignore next */
        throw Error('randomAlphaString: num_chars needs to be a positive integer.')
    }
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

const urlFromUri = (uri: string) => {
    if (uri.startsWith('gs://')) {
        const p = uri.slice("gs://".length)
        return `https://storage.googleapis.com/${p}`
    }
    else return uri
}

const publishMessageAsync = async (channel: Ably.Types.ChannelCallbacks, message: any) => {
    return new Promise<void>((resolve, reject) => {
        channel.publish({
            data: message
        }, (err: Error) => {
            if (err) {
                reject(err)
                return
            }
            resolve()
        })
    })
}

module.exports = (req: VercelRequest, res: VercelResponse) => {
    const {body: request} = req
    if (!isRegisterRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    ;(async () => {
        const { backendProviderUri, type, secret } = request
        const url0 = urlFromUri(backendProviderUri)
        const response = await axios.get(cacheBust(url0), {responseType: 'json'})
        const backendProviderConfig: {label: string, objectStorageUrl: string, secretSha1: string} = response.data

        if (request.type === 'registerBackendProvider') {
            const {secretSha1} = backendProviderConfig
            if (!secret) {
                throw Error(`Missing secret.`)
            }
            if (secretSha1 !== sha1OfString(secret).toString()) {
                throw Error(`Invalid secret: ${secretSha1} <> ${sha1OfString(secret)}`)
            }
        }

        const backendProviderUriHash = sha1OfString(backendProviderUri)

        // Note that this uses Ably.Rest, not Realtime. This is because we don't want
        // to start a websocket connection to Ably just to make one publish, that
        // would be inefficient. Ably.Rest makes the publish as a REST request.
        const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });

        let tokenDetails: any | null
        const clientChannelName = 'client_' + backendProviderUriHash.toString()
        const serverChannelName = 'server_' + backendProviderUriHash.toString()
        const capability: {[key: string]: string[]} = {}
        
        if (type === 'registerBackendProvider') {
            capability[clientChannelName] = ["history", "subscribe"] // order matters i think
        }
        else if (type === 'registerClient') {
            capability[clientChannelName] = ["publish"] // order matters i think
        }

        if (type === 'registerBackendProvider') {
            capability[serverChannelName] = ["publish"] // order matters i think
            capability['probe'] = ["history", "subscribe"] // order matters i think
        }
        else if (type === 'registerClient') {
            capability[serverChannelName] = ["history", "subscribe"] // order matters i think
        }

        tokenDetails = await requestAblyToken({ablyRestClient: ably, capability})
        
        const r: RegistrationResult = {
            backendProviderConfig,
            clientChannelName,
            serverChannelName,
            tokenDetails
        }
        return r
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}