import { Button, TextField } from '@material-ui/core'
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { FunctionComponent } from "react"
import { ChannelName, isChannelName, nowTimestamp } from 'kachery-js/types/kacheryTypes'
import useChannel from 'kachery-react/useChannel'
import ChannelsTable, { getChannelConfig } from './ChannelsTable'
import channelItemsReducer, { initialChannelItems } from './channelItemsReducer'

type Props = {
    onClose: () => void
    hardCodedChannels?: ChannelName[]
}

const SelectChannel: FunctionComponent<Props> = ({onClose, hardCodedChannels}) => {
    const {
        channelName: selectedChannel,
        selectChannel
    } = useChannel()
    
    const [channelItems, channelItemsDispatch] = useReducer(channelItemsReducer, initialChannelItems())
    const channelItems2 = useMemo(() => {
        const ret = channelItems.filter(item => (!(hardCodedChannels || []).includes(item.channel)))
        for (let x of (hardCodedChannels || [])) {
            ret.push({
                channel: x,
                lastUsed: 0 // 0 means it is hard-coded
            })
        }
        return ret
    }, [channelItems, hardCodedChannels])

    const [editChannel, setEditChannel] = useState<string>('')
    useEffect(() => {
        setEditChannel(selectedChannel?.toString() || '')
    }, [selectedChannel])
    const handleChange = useCallback((evt: any) => {
        const val: string = evt.target.value
        setEditChannel(val)
    }, [])
    const handleSelectChannel = useCallback((channel: ChannelName) => {
        getChannelConfig(channel).then(config => {
            channelItemsDispatch({
                type: 'addItem',
                item: {
                    channel,
                    lastUsed: Number(nowTimestamp())
                }
            })
            selectChannel(channel)
            onClose()
        })
    }, [selectChannel, onClose])
    const handleOkay = useCallback(() => {
        if (!editChannel) return
        if (!isChannelName(editChannel)) return
        handleSelectChannel(editChannel)
    }, [handleSelectChannel, editChannel])
    const handleKeyDown = useCallback((e: any) => {
        if (e.keyCode === 13) {
           handleOkay()
        }
    }, [handleOkay])
    return (
        <div>
            <h3>Select a kachery channel</h3>
            <TextField style={{width: '100%'}} label="Channel" value={editChannel} onChange={handleChange} onKeyDown={handleKeyDown} />
            <Button onClick={handleOkay} disabled={editChannel === (selectedChannel || '').toString()}>Set channel</Button>
            <ChannelsTable
                channelItems={channelItems2}
                channelItemsDispatch={channelItemsDispatch}
                selectedChannel={editChannel as any as ChannelName}
                onSelectChannel={handleSelectChannel}
            />
        </div>
    )
}

export default SelectChannel