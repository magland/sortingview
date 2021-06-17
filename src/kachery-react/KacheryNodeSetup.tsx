import React from 'react'
import { FunctionComponent } from "react"
import KacheryNodeContext from './KacheryNodeContext';
import useSetupKacheryNode from './useSetupKacheryNode';

const KacheryNodeSetup: FunctionComponent = (props) => {
    const kacheryNode = useSetupKacheryNode()
    return (
        <KacheryNodeContext.Provider value={kacheryNode}>
            {props.children}
        </KacheryNodeContext.Provider>
    )
}

export default KacheryNodeSetup