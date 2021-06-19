import { IconButton } from '@material-ui/core';
import { Storage } from '@material-ui/icons';
import useChannel from 'kachery-react/useChannel';
import React, { FunctionComponent, useCallback, useMemo } from 'react';

type Props = {
    onOpen: () => void
    color: any
}

const ChannelControl: FunctionComponent<Props> = ({ onOpen, color }) => {
    const {channelName} = useChannel()
    const { icon, title } = useMemo(() => {
        return {icon: <Storage />, title: channelName ? `Channel: ${channelName}` : 'Configure channel'}
    }, [channelName])

    const handleClick = useCallback(() => {
        onOpen()
    }, [onOpen])

    return (
        <IconButton style={{color}} title={title} onClick={handleClick}>{icon}</IconButton>
    );
}

export default ChannelControl