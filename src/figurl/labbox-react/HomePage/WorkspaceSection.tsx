import { IconButton } from '@material-ui/core'
import { Help } from '@material-ui/icons'
import { useVisible } from 'figurl/labbox-react'
import Hyperlink from 'figurl/labbox-react/components/Hyperlink/Hyperlink'
import MarkdownDialog from 'figurl/labbox-react/components/Markdown/MarkdownDialog'
import React, { FunctionComponent, useCallback } from 'react'
import useRoute from '../MainWindow/useRoute'
import aboutWorkspacesMd from './aboutWorkspaces.md.gen'
import hyperlinkStyle from './hyperlinkStyle'

type Props = {
    packageName: string
    workspaceDescription: string
}

const WorkspaceSection: FunctionComponent<Props> = ({packageName, workspaceDescription}) => {
    const {setRoute, channel} = useRoute()

    const handleSelectWorkspace = useCallback(() => {
        setRoute({routePath: '/selectWorkspace'})
    }, [setRoute])

    // const handleViewWorkspace = useCallback(() => {
    //     setRoute({routePath: '/workspace'})
    // }, [setRoute])

    const aboutWorkspacesVisible = useVisible()

    return (
        channel ? (
            <div className="WorkspaceSection HomeSection">
                <h3>Select a workspace <IconButton onClick={aboutWorkspacesVisible.show}><Help /></IconButton></h3>
                <h4>Note: Do not depend on the following link. It will disappear at some point:</h4>
                <Hyperlink style={hyperlinkStyle} onClick={handleSelectWorkspace}>select a workspace</Hyperlink>
                <MarkdownDialog
                    visible={aboutWorkspacesVisible.visible}
                    onClose={aboutWorkspacesVisible.hide}
                    substitute={{
                        'PACKAGENAME': packageName,
                        'WORKSPACE_DESCRIPTION': workspaceDescription
                    }}
                    source={aboutWorkspacesMd}
                />
            </div>
        ) : (
            <span />
        )
    )
}

export default WorkspaceSection