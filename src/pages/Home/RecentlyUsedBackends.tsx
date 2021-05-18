import React from 'react'
import { FunctionComponent } from "react"
import Hyperlink from '../../python/sortingview/gui/commonComponents/Hyperlink/Hyperlink'
import { loadBackendItems } from '../../python/sortingview/gui/labbox/ApplicationBar/backendProviderItemsReducer'

type Props = {
    onSelectBackend: (uri: string) => void
}

const RecentlyUsedBackends: FunctionComponent<Props> = ({onSelectBackend}) => {
    const backendItems = loadBackendItems()
    return (
        backendItems.length > 0 ? (
            <p>Recently used backends: {backendItems.map(x => (<span><Hyperlink onClick={() => {onSelectBackend(x.uri)}}>{x.label}</Hyperlink>&nbsp;</span>))}</p>
        ) : <span />
    )
}

export default RecentlyUsedBackends