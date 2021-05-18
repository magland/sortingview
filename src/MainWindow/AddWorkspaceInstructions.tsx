import React from 'react'
import { FunctionComponent } from "react"
import Markdown from '../python/sortingview/gui/commonComponents/Markdown/Markdown'
import { useBackendProviderClient } from '../python/sortingview/gui/labbox'
import addWorkspaceMd from './addWorkspace.md.gen'

type Props = {
    
}

const AddWorkspaceInstructions: FunctionComponent<Props> = () => {
    const backendUri = useBackendProviderClient()?.backendUri
    return (
        <Markdown
            source={addWorkspaceMd}
            substitute={{
                backendUri
            }}
        />
    )
}

export default AddWorkspaceInstructions