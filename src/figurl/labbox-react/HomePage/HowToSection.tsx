import { useChannel } from 'figurl/kachery-react';
import React, { FunctionComponent } from 'react';
import createWorkspaceMd from '../../../python/sortingview/gui/helpPages/CreateWorkspace.md.gen';
import Hyperlink from '../components/Hyperlink/Hyperlink';
import MarkdownDialog from '../components/Markdown/MarkdownDialog';
import useVisible from '../misc/useVisible';

type Props = {

}

const HowToSection: FunctionComponent<Props> = () => {
    const {channelName} = useChannel()
    const createWorkspaceV = useVisible()
    const loc = (window as any).location
    return (
        <div>
            <Hyperlink onClick={createWorkspaceV.show}>Create a new workspace</Hyperlink>
            <MarkdownDialog
                visible={createWorkspaceV.visible}
                onClose={createWorkspaceV.hide}
                source={createWorkspaceMd}
                substitute={{
                    channel: channelName.toString(),
                    baseUrl: `${loc.protocol}//${loc.host}`
                }}
            />
        </div>
    )
}

export default HowToSection