import React, { useCallback } from 'react'
import { FunctionComponent } from "react"
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink'
import useRoute from '../../route/useRoute'
import hyperlinkStyle from './hyperlinkStyle'

type Props = {
    
}

const WorkspaceSection: FunctionComponent<Props> = () => {
    const {setRoute, channel, workspaceUri} = useRoute()

    const handleSelectWorkspace = useCallback(() => {
        setRoute({routePath: '/selectWorkspace'})
    }, [setRoute])

    const handleViewWorkspace = useCallback(() => {
        setRoute({routePath: '/workspace'})
    }, [setRoute])

    return (
        channel ? (
            <div className="WorkspaceSection HomeSection">
                <span>
                    
                    {
                        workspaceUri ? (
                            <span>
                                <p>The selected workspace is: {workspaceUri}</p>
                                <p><Hyperlink style={hyperlinkStyle} onClick={handleSelectWorkspace}>Select a different workspace</Hyperlink></p>
                                <Hyperlink style={hyperlinkStyle} onClick={handleViewWorkspace}>View this workspace</Hyperlink>
                            </span>
                        ) : (
                            <span>
                                <p>The next step is to <Hyperlink style={hyperlinkStyle} onClick={handleSelectWorkspace}>select a workspace</Hyperlink>.</p>
                            </span>
                        )
                    }
                </span>
            </div>
        ) : (
            <span />
        )
    )
}

export default WorkspaceSection