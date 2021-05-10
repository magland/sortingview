import React from 'react'
import { FunctionComponent } from "react"

type Props = {
    onWorkspaceSelected: (workspaceUri: string) => void
}

const WorkspaceList: FunctionComponent<Props> = ({onWorkspaceSelected}) => {
    return <div>Workspace list</div>
}

export default WorkspaceList