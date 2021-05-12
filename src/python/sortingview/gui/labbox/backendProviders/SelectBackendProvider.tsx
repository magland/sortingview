import { Button, TextField } from '@material-ui/core'
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { FunctionComponent } from "react"
import useBackendProviders from './useBackendProviders'
import BackendProvidersTable, { getBackendProviderConfig } from '../ApplicationBar/BackendProvidersTable'
import backendProviderItemsReducer, { initialBackendProviderItems } from '../ApplicationBar/backendProviderItemsReducer'

type Props = {
    onClose: () => void
}

const SelectBackendProvider: FunctionComponent<Props> = ({onClose}) => {
    const {
        selectedBackendProviderUri,
        selectBackendProvider
    } = useBackendProviders()
    
    const [backendProviderItems, backendProviderItemsDispatch] = useReducer(backendProviderItemsReducer, initialBackendProviderItems())

    const [editBackendProviderUri, setEditBackendProviderUri] = useState<string>('')
    useEffect(() => {
        setEditBackendProviderUri(selectedBackendProviderUri || '')
    }, [selectedBackendProviderUri])
    const handleChange = useCallback((evt: any) => {
        const val: string = evt.target.value
        setEditBackendProviderUri(val)
    }, [])
    const handleSelectBackendProvider = useCallback((uri: string) => {
        getBackendProviderConfig(uri).then(config => {
            backendProviderItemsDispatch({
                type: 'addItem',
                item: {
                    uri,
                    label: config?.label || '',
                    lastUsed: Number(new Date())
                }
            })
            selectBackendProvider(uri)
            onClose()
        })
    }, [selectBackendProvider, onClose])
    const handleOkay = useCallback(() => {
        if (!editBackendProviderUri) return
        handleSelectBackendProvider(editBackendProviderUri)
    }, [handleSelectBackendProvider, editBackendProviderUri])
    const handleKeyDown = useCallback((e: any) => {
        if (e.keyCode === 13) {
           handleOkay()
        }
    }, [handleOkay])
    return (
        <div>
            <h3>Select a backend provider</h3>
            <TextField style={{width: '100%'}} label="Backend provider URI" value={editBackendProviderUri} onChange={handleChange} onKeyDown={handleKeyDown} />
            <Button onClick={handleOkay} disabled={editBackendProviderUri === selectedBackendProviderUri}>Set backend provider</Button>
            <BackendProvidersTable
                backendProviderItems={backendProviderItems}
                backendProviderItemsDispatch={backendProviderItemsDispatch}
                selectedBackendProviderUri={editBackendProviderUri}
                onSelectBackendProvider={handleSelectBackendProvider}
            />
        </div>
    )
}

export default SelectBackendProvider