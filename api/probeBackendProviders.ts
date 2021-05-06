import { VercelRequest, VercelResponse } from '@vercel/node'
import Ably from 'ably'

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

let lastProbeTimestamp: number | null  = null // some state does persist in serverless. See: https://engineering.flosports.tv/persistent-data-in-lambda-it-works-ca0c1b25879e

module.exports = (req: VercelRequest, res: VercelResponse) => {
    ;(async () => {
        // Note that this uses Ably.Rest, not Realtime. This is because we don't want
        // to start a websocket connection to Ably just to make one publish, that
        // would be inefficient. Ably.Rest makes the publish as a REST request.
        const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY })
        
        const probeChannel = ably.channels.get('probe')

        // do not publish probe message if already did so recently
        const elapsed = (lastProbeTimestamp !== null) ? Number(new Date()) - lastProbeTimestamp : null
        const doPublish = elapsed === null || (elapsed > 10000)
        if (doPublish) {
            await publishMessageAsync(probeChannel, {type: 'probeBackendProviders', appName: 'sortingview'})
        }
        res.json({
            success: true,
            published: doPublish
        })
    })().catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}