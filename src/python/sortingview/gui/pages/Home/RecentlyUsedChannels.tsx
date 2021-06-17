import React from 'react'
import { FunctionComponent } from "react"
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink'
import { loadChannelItems } from '../../labbox/ApplicationBar/channelItemsReducer'
import { ChannelName } from 'kachery-js/types/kacheryTypes'

type Props = {
    onSelectChannel: (channel: ChannelName) => void
}

const RecentlyUsedBackends: FunctionComponent<Props> = ({onSelectChannel}) => {
    const channelItems = loadChannelItems()
    return (
        channelItems.length > 0 ? (
            <p>Recently used channels: {channelItems.map(x => (<span key={x.channel.toString()}><Hyperlink onClick={() => {onSelectChannel(x.channel)}}>{x.channel}</Hyperlink>&nbsp;</span>))}</p>
        ) : <span />
    )
}

export default RecentlyUsedBackends