import React, { useMemo } from 'react'
import { FunctionComponent } from "react"
import Hyperlink from '../python/sortingview/gui/commonComponents/Hyperlink/Hyperlink'
import NiceTable from '../python/sortingview/gui/commonComponents/NiceTable/NiceTable'
import { ExampleWorkspaceType } from './WorkspaceList'

type Props = {
    examples: ExampleWorkspaceType[]
    onExampleSelected: (example: ExampleWorkspaceType) => void
}

const ExampleWorkspacesTable: FunctionComponent<Props> = ({examples, onExampleSelected}) => {
    const columns = useMemo(() => ([
        {
            key: 'label',
            label: 'Workspace'
        },
        {
            key: 'uri',
            label: 'URI'
        },
    ]), [])
    const rows = useMemo(() => (
        examples.map((x, i)=> ({
            key: i + '',
            columnValues: {
                label: {
                    text: x.workspaceLabel,
                    element: <Hyperlink onClick={() => {onExampleSelected(x)}}>{x.workspaceLabel}</Hyperlink>
                },
                uri: x.workspaceUri
            }
        }))
    ), [examples, onExampleSelected])
    return (
        <NiceTable
            columns={columns}
            rows={rows}
        />
    )
}

export default ExampleWorkspacesTable