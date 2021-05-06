import { IconButton } from '@material-ui/core';
import { Storage } from '@material-ui/icons';
import React, { FunctionComponent, useCallback, useMemo } from 'react';

type Props = {
    onOpen: () => void
    color: any
}

const BackendProviderControl: FunctionComponent<Props> = ({ onOpen, color }) => {
    const { icon, title } = useMemo(() => {
        return {icon: <Storage />, title: 'Configure backend provider'}
    }, [])

    const handleClick = useCallback(() => {
        onOpen()
    }, [onOpen])

    return (
        <IconButton style={{color}} title={title} onClick={handleClick}>{icon}</IconButton>
    );
}

export default BackendProviderControl