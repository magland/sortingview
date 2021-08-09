import useChannel from 'figurl/kachery-react/useChannel';
import Markdown from 'figurl/labbox-react/components/Markdown/Markdown';
import React, { FunctionComponent } from 'react';
import addWorkspaceMd from './addWorkspace.md.gen';

type Props = {
    
}

const AddWorkspaceInstructions: FunctionComponent<Props> = () => {
    const {channelName} = useChannel()
    return (
        <Markdown
            source={addWorkspaceMd}
            substitute={{
                // channelName: channelName ? channelName.toString() : 'undefined'
                'CHANNEL_NAME': channelName ? channelName.toString() : 'undefined'
            }}
        />
    )
}

export default AddWorkspaceInstructions