import { IconButton } from '@material-ui/core'
import { Help } from '@material-ui/icons'
import { useVisible } from 'labbox-react'
import Hyperlink from 'labbox-react/components/Hyperlink/Hyperlink'
import MarkdownDialog from 'labbox-react/components/Markdown/MarkdownDialog'
import React, { FunctionComponent, useCallback } from 'react'
import useRoute from '../MainWindow/useRoute'
import aboutWorkspacesMd from './aboutWorkspaces.md.gen'
import hyperlinkStyle from './hyperlinkStyle'

type Props = {
    packageName: string
    workspaceDescription: string
}

const WorkspaceSection: FunctionComponent<Props> = ({packageName, workspaceDescription}) => {
    const {setRoute, channel, workspaceUri} = useRoute()

    const handleSelectWorkspace = useCallback(() => {
        setRoute({routePath: '/selectWorkspace'})
    }, [setRoute])

    const handleViewWorkspace = useCallback(() => {
        setRoute({routePath: '/workspace'})
    }, [setRoute])

    const aboutWorkspacesVisible = useVisible()

    return (
        channel ? (
            <div className="WorkspaceSection HomeSection">
                <h3>Select a workspace <IconButton onClick={aboutWorkspacesVisible.show}><Help /></IconButton></h3>
                <span>
                    {
                        workspaceUri ? (
                            
                            <span>
                                <Hyperlink style={hyperlinkStyle} onClick={handleViewWorkspace}>{workspaceUri}</Hyperlink>
                                <p><Hyperlink style={hyperlinkStyle} onClick={handleSelectWorkspace}>Select a different workspace or add a new workspace</Hyperlink></p>
                            </span>
                        ) : (
                            <Hyperlink style={hyperlinkStyle} onClick={handleSelectWorkspace}>select a workspace</Hyperlink>
                        )
                    }
                </span>
                <MarkdownDialog
                    visible={aboutWorkspacesVisible.visible}
                    onClose={aboutWorkspacesVisible.hide}
                    substitute={{
                        packageName,
                        workspaceDescription
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