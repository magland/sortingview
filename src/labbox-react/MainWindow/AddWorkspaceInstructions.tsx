import React from 'react'
import { FunctionComponent } from "react"
import Markdown from 'labbox-react/components/Markdown/Markdown';
import useChannel from 'kachery-react/useChannel'
import addWorkspaceMd from './addWorkspace.md.gen'

type Props = {
    
}

const AddWorkspaceInstructions: FunctionComponent<Props> = () => {
    const {channelName} = useChannel()
    return (
        <Markdown
            source={addWorkspaceMd}
            substitute={{
                channelName: channelName ? channelName.toString() : 'undefined'
            }}
        />
    )
}

export default AddWorkspaceInstructions