import { Button } from '@material-ui/core'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FunctionComponent } from "react"
import axios from 'axios'
import NiceTable from '../../commonComponents/NiceTable/NiceTable'
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink'
import { randomAlphaString } from '../objectStorage/google/GoogleObjectStorageClient'
import { BackendItem, BackendProviderItemsAction } from './backendProviderItemsReducer'

type Props = {
    selectedBackendProviderUri: string | undefined
    onSelectBackendProvider: (uri: string) => void
    backendProviderItems: BackendItem[]
    backendProviderItemsDispatch: (a: BackendProviderItemsAction) => void
}

const BackendProvidersTable: FunctionComponent<Props> = ({selectedBackendProviderUri, onSelectBackendProvider, backendProviderItems, backendProviderItemsDispatch}) => {
    const [backendProviderStatuses, setBackendProviderStatuses] = useState<{[key: string]: {alive: boolean}}>({})
    const columns = useMemo(() => ([
        {
            key: 'label',
            label: 'Backend provider'
        },
        {
            key: 'uri',
            label: 'URI'
        },
        {
            key: 'alive',
            label: 'Alive'
        },
        {
            key: 'forget',
            label: 'Forget'
        }
    ]), [])
    // const handleSelect = useCallback((uri: string) => {
    //     computeEngineInterface.setComputeEngineConfigUri(uri)
    // }, [])
    const handleForgetItem = useCallback((item: BackendItem) => {
        backendProviderItemsDispatch({type: 'removeItem', uri: item.uri})
    }, [backendProviderItemsDispatch])
    const rows = useMemo(() => (
        (backendProviderItems || []).map(x=> ({
            key: x.uri,
            columnValues: {
                label: {
                    text: x.label,
                    element: <Hyperlink onClick={() => {onSelectBackendProvider(x.uri)}}>{x.label}</Hyperlink>
                },
                uri: x.uri,
                alive: (backendProviderStatuses[x.uri] || {}).alive ? 'YES' : 'NO',
                forget: x.lastUsed === 0 ? '' : {
                    element: <button onClick={() => {handleForgetItem(x)}}>forget</button>
                }
            }
        }))
    ), [onSelectBackendProvider, backendProviderStatuses, backendProviderItems, handleForgetItem])
    const handleSelectedRowKeysChanged = useCallback((uris: string[]) => {
        if (uris[0]) {
            onSelectBackendProvider(uris[0])
        }
    }, [onSelectBackendProvider])
    const handleRefresh = useCallback(() => {
        ;(async () => {
            const newBackendProviderStatuses = {...backendProviderStatuses}
            let somethingChanged = false
            for (let x of backendProviderItems) {
                const alive = await checkBackendProviderAlive(x.uri)
                const newStatus = {alive}
                const currentStatus = newBackendProviderStatuses[x.uri] || {alive: false}
                if (JSON.stringify(newStatus) !== JSON.stringify(currentStatus)) {
                    newBackendProviderStatuses[x.uri] = newStatus
                    somethingChanged = true
                }
            }
            if (somethingChanged) {
                setBackendProviderStatuses(newBackendProviderStatuses)
            }
        })()
    }, [backendProviderStatuses, backendProviderItems])
    useEffect(() => {
        handleRefresh()
    }, [handleRefresh])
    return (
        <div>
            <Button onClick={handleRefresh}>Refresh list</Button>
            {
                backendProviderItems.length === 0 ? (
                    <div>No backend providers to show.</div>
                ) : (
                    <NiceTable
                        columns={columns}
                        rows={rows}
                        selectionMode={"single"}
                        selectedRowKeys={selectedBackendProviderUri ? {[selectedBackendProviderUri]: true} : {}}
                        onSelectedRowKeysChanged={handleSelectedRowKeysChanged}
                    />
                )
            }
        </div>
    )
}

const checkBackendProviderAlive = async (uri: string) => {
    const config = await getBackendProviderConfig(uri)
    if (!config) return false
    const timestamp = config.timestamp
    const elapsed = Number(new Date()) / 1000 - timestamp
    if (Math.abs(elapsed) <= 70) return true
    return false
}

export const getBackendProviderConfig = async (uri: string) => {
    const url = urlFromUri(uri)
    try {
        const response = await axios.get(cacheBust(url), {responseType: 'json'})
        const backendProviderConfig: {label: string, objectStorageUrl: string, secretSha1: string, timestamp: number} = response.data
        if (!backendProviderConfig.timestamp) return null
        return backendProviderConfig
    }
    catch(err) {
        return null
    }
}

const cacheBust = (url: string) => {
    if (url.includes('?')) {
        return url + `&cb=${randomAlphaString(10)}`
    }
    else {
        return url + `?cb=${randomAlphaString(10)}`
    }
}

const urlFromUri = (uri: string) => {
    if (uri.startsWith('gs://')) {
        const p = uri.slice("gs://".length)
        return `https://storage.googleapis.com/${p}`
    }
    else return uri
}

export default BackendProvidersTable