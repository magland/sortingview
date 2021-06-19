import { Button } from '@material-ui/core'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import Hyperlink from 'labbox-react/components/Hyperlink/Hyperlink'
import NiceTable from 'labbox-react/components/NiceTable/NiceTable';
import { ChannelName } from 'kachery-js/types/kacheryTypes'
import { ChannelItem, ChannelItemsAction } from './channelItemsReducer'

type Props = {
    selectedChannel: ChannelName | undefined
    onSelectChannel: (channel: ChannelName) => void
    channelItems: ChannelItem[]
    channelItemsDispatch: (a: ChannelItemsAction) => void
}

const ChannelsTable: FunctionComponent<Props> = ({selectedChannel, onSelectChannel, channelItems, channelItemsDispatch}) => {
    const [channelStatuses, setChannelStatuses] = useState<{[key: string]: {alive: boolean}}>({})
    const columns = useMemo(() => ([
        {
            key: 'channel',
            label: 'Channel'
        },
        // {
        //     key: 'alive',
        //     label: 'Alive'
        // },
        {
            key: 'forget',
            label: 'Forget'
        }
    ]), [])
    const handleForgetItem = useCallback((item: ChannelItem) => {
        channelItemsDispatch({type: 'removeItem', channel: item.channel})
    }, [channelItemsDispatch])
    const rows = useMemo(() => (
        (channelItems || []).map(x=> ({
            key: x.channel.toString(),
            columnValues: {
                channel: {
                    text: x.channel,
                    element: <Hyperlink onClick={() => {onSelectChannel(x.channel)}}>{x.channel}</Hyperlink>
                },
                // alive: (channelStatuses[x.channel.toString()] || {}).alive ? 'YES' : 'NO',
                forget: x.lastUsed === 0 ? '' : {
                    element: <button onClick={() => {handleForgetItem(x)}}>forget</button>
                }
            }
        }))
    ), [onSelectChannel, channelItems, handleForgetItem])
    const handleSelectedRowKeysChanged = useCallback((channels: string[]) => {
        if (channels[0]) {
            onSelectChannel(channels[0] as any as ChannelName)
        }
    }, [onSelectChannel])
    const handleRefresh = useCallback(() => {
        ;(async () => {
            const newChannelStatuses = {...channelStatuses}
            let somethingChanged = false
            for (let x of channelItems) {
                const alive = await checkChannelAlive(x.channel)
                const newStatus = {alive}
                const currentStatus = newChannelStatuses[x.channel.toString()] || {alive: false}
                if (JSON.stringify(newStatus) !== JSON.stringify(currentStatus)) {
                    newChannelStatuses[x.channel.toString()] = newStatus
                    somethingChanged = true
                }
            }
            if (somethingChanged) {
                setChannelStatuses(newChannelStatuses)
            }
        })()
    }, [channelStatuses, channelItems])
    useEffect(() => {
        handleRefresh()
    }, [handleRefresh])
    return (
        <div>
            <Button onClick={handleRefresh}>Refresh list</Button>
            {
                channelItems.length === 0 ? (
                    <div>No channels to show.</div>
                ) : (
                    <NiceTable
                        columns={columns}
                        rows={rows}
                        selectionMode={"single"}
                        selectedRowKeys={selectedChannel ? [selectedChannel.toString()] : []}
                        onSelectedRowKeysChanged={handleSelectedRowKeysChanged}
                    />
                )
            }
        </div>
    )
}

const checkChannelAlive = async (channel: ChannelName) => {
    const config = await getChannelConfig(channel)
    if (!config) return false
    return false
    // const timestamp = config.timestamp
    // const elapsed = Number(new Date()) / 1000 - timestamp
    // if (Math.abs(elapsed) <= 70) return true
    // return false
}

export const getChannelConfig = async (channel: ChannelName) => {
    return null
}

export default ChannelsTable