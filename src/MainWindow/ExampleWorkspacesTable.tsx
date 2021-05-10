import React, { useMemo } from 'react'
import { FunctionComponent } from "react"
import Hyperlink from '../reusable/common/Hyperlink'
import NiceTable from '../reusable/common/NiceTable/NiceTable'
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