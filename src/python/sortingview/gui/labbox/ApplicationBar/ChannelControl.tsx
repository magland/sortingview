import { IconButton } from '@material-ui/core';
import { Storage } from '@material-ui/icons';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import useRoute from '../../route/useRoute';

type Props = {
    onOpen: () => void
    color: any
}

const ChannelControl: FunctionComponent<Props> = ({ onOpen, color }) => {
    const {channel} = useRoute()
    const { icon, title } = useMemo(() => {
        return {icon: <Storage />, title: channel ? `Channel: ${channel}` : 'Configure channel'}
    }, [channel])

    const handleClick = useCallback(() => {
        onOpen()
    }, [onOpen])

    return (
        <IconButton style={{color}} title={title} onClick={handleClick}>{icon}</IconButton>
    );
}

export default ChannelControl