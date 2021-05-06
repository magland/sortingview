import { Button } from '@material-ui/core'
import React, { useCallback, useMemo } from 'react'
import { FunctionComponent } from "react"
import useBackendProviders from '../backendProviders/useBackendProviders'
import NiceTable from '../../reusable/common/NiceTable/NiceTable'

type Props = {
    selectedBackendProviderUri: string | undefined
    onSelectBackendProvider: (uri: string) => void
}

const BackendProvidersTable: FunctionComponent<Props> = ({selectedBackendProviderUri, onSelectBackendProvider}) => {
    const {
        registeredBackendProviders,
        refreshRegisteredBackendProviders
    } = useBackendProviders()
    

    const columns = useMemo(() => ([
        {
            key: 'label',
            label: 'Backend provider'
        },
        {
            key: 'uri',
            label: 'URI'
        }
    ]), [])
    // const handleSelect = useCallback((uri: string) => {
    //     computeEngineInterface.setComputeEngineConfigUri(uri)
    // }, [])
    const rows = useMemo(() => (
        (registeredBackendProviders || []).map(x=> ({
            key: x.backendProviderUri,
            columnValues: {
                label: {
                    text: x.label
                    // element: <Hyperlink onClick={() => {handleSelect(x.computeEngineConfigUri)}}>{x.computeEngineConfig.label}</Hyperlink>
                },
                uri: x.backendProviderUri
            }
        }))
    ), [registeredBackendProviders])
    const handleSelectedRowKeysChanged = useCallback((uris: string[]) => {
        if (uris[0]) {
            onSelectBackendProvider(uris[0])
        }
    }, [onSelectBackendProvider])
    const handleRefresh = useCallback(() => {
        refreshRegisteredBackendProviders()
    }, [refreshRegisteredBackendProviders])
    return (
        <div>
            <Button onClick={handleRefresh}>Refresh list</Button>
            {
                registeredBackendProviders === undefined ? (
                    <div>Loading registered backend providers</div>
                ) : registeredBackendProviders.length === 0 ? (
                    <div>No backend providers registered</div>
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

export default BackendProvidersTable