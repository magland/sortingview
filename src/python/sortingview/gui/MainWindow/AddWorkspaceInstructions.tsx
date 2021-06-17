import React from 'react'
import { FunctionComponent } from "react"
import Markdown from '../commonComponents/Markdown/Markdown'
import useSelectedChannel from '../pages/Home/useSelectedChannel'
import addWorkspaceMd from './addWorkspace.md.gen'

type Props = {
    
}

const AddWorkspaceInstructions: FunctionComponent<Props> = () => {
    const {selectChannel: channelName} = useSelectedChannel()
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