import { VercelRequest, VercelResponse } from '@vercel/node'
import Ably from 'ably'
import { JSONValue } from './common/misc'
import { isRegisterMessage, RegisteredBackendProvider } from './apiInterface'

const getMessageHistory = async (channel: Ably.Types.ChannelCallbacks) => {
    return new Promise<JSONValue[]>((resolve, reject) => {
        const ret: JSONValue[] = []
        const processPage = (page: Ably.Types.PaginatedResult<Ably.Types.Message>) => {
            try {
                for (let item of page.items) {
                    const msg = item.data
                    ret.push(msg)
                }
            }
            catch(e) {
                reject(e)
                return
            }
            if (page.hasNext()) {
                page.next((err, nextPage) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    if (!nextPage) {
                        reject('Unexpected: nextPage is not defined')
                        return
                    }
                    if (nextPage) processPage(nextPage)
                })
            }
            else {
                resolve(ret)
            }
        }
        channel.history((err, resultPage) => {
            if (err) {
                reject(err)
                return
            }
            if (!resultPage) {
                reject('Unexpected: resultPage is not defined')
                return
            }
            processPage(resultPage)
        })
    })
}

module.exports = (req: VercelRequest, res: VercelResponse) => {
    ;(async () => {
        // Note that this uses Ably.Rest, not Realtime. This is because we don't want
        // to start a websocket connection to Ably just to make one publish, that
        // would be inefficient. Ably.Rest makes the publish as a REST request.
        const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY })
        
        const registerChannel = ably.channels.get('register')

        const messages = await getMessageHistory(registerChannel)
        const unregisteredX: {[key: string]: boolean} = {}
        const X: {[key: string]: RegisteredBackendProvider} = {}
        for (let msg of messages) {
            if (isRegisterMessage(msg)) {
                if (msg.type === 'registerBackendProvider') {
                    const {backendProviderUri, label, objectStorageUrl} = msg
                    if ((!(backendProviderUri in X)) && (!(backendProviderUri in unregisteredX))) {
                        X[backendProviderUri] = {
                            backendProviderUri,
                            appName: 'sortingview',
                            label,
                            objectStorageUrl
                        }
                    }
                }
                else if (msg.type === 'unregisterBackendProvider') {
                    const {backendProviderUri} = msg
                    if (!(backendProviderUri in X)) {
                        unregisteredX[backendProviderUri] = true
                    }
                }
            }
        }
        const ret: RegisteredBackendProvider[] = Object.values(X)
        ret.sort((a, b) => ((a.backendProviderUri < b.backendProviderUri) ? -1 : (a.backendProviderUri > b.backendProviderUri) ? 1 : 0))
        res.json(ret)
    })().catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}