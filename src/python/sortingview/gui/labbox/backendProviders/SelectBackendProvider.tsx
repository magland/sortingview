import { Button, TextField } from '@material-ui/core'
import React, { useCallback, useEffect, useState } from 'react'
import { FunctionComponent } from "react"
import useBackendProviders from './useBackendProviders'
import BackendProvidersTable from '../ApplicationBar/BackendProvidersTable'

type Props = {
    onClose: () => void
}

const SelectBackendProvider: FunctionComponent<Props> = ({onClose}) => {
    const {
        selectedBackendProviderUri,
        selectBackendProvider
    } = useBackendProviders()
    
    const [editBackendProviderUri, setEditBackendProviderUri] = useState<string>('')
    useEffect(() => {
        setEditBackendProviderUri(selectedBackendProviderUri || '')
    }, [selectedBackendProviderUri])
    const handleChange = useCallback((evt: any) => {
        const val: string = evt.target.value
        setEditBackendProviderUri(val)
    }, [])
    const handleOkay = useCallback(() => {
        selectBackendProvider(editBackendProviderUri)
        onClose()
    }, [editBackendProviderUri, selectBackendProvider, onClose])
    const handleKeyDown = useCallback((e: any) => {
        if (e.keyCode === 13) {
           handleOkay()
        }
    }, [handleOkay])
    const handleSelectBackendProvider = useCallback((uri: string) => {
        selectBackendProvider(uri)
        onClose()
    }, [selectBackendProvider, onClose])
    return (
        <div>
            <h3>Select a backend provider</h3>
            <TextField style={{width: '100%'}} label="Backend provider URI" value={editBackendProviderUri} onChange={handleChange} onKeyDown={handleKeyDown} />
            <Button onClick={handleOkay} disabled={editBackendProviderUri === selectedBackendProviderUri}>Change backend provider</Button>
            <BackendProvidersTable
                selectedBackendProviderUri={editBackendProviderUri}
                onSelectBackendProvider={handleSelectBackendProvider}
            />
        </div>
    )
}

export default SelectBackendProvider