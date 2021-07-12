import { NodeLabel } from 'kachery-js/types/kacheryTypes';
import React from 'react'
import { FunctionComponent } from "react"
import KacheryNodeContext from './KacheryNodeContext';
import useSetupKacheryNode from './useSetupKacheryNode';

type Props = {
    nodeLabel: NodeLabel
}

const KacheryNodeSetup: FunctionComponent<Props> = ({nodeLabel, children}) => {
    const kacheryNode = useSetupKacheryNode(nodeLabel)
    return (
        <KacheryNodeContext.Provider value={kacheryNode}>
            {children}
        </KacheryNodeContext.Provider>
    )
}

export default KacheryNodeSetup