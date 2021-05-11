import React, { useMemo } from 'react'
import { FunctionComponent } from "react"
import Hyperlink from '../python/sortingview/gui/commonComponents/Hyperlink/Hyperlink'
import NiceTable from '../python/sortingview/gui/commonComponents/NiceTable/NiceTable'

type Props = {
    examples: ExampleRecordingSortingType[]
    onExampleSelected: (example: ExampleRecordingSortingType) => void
}

export type ExampleRecordingSortingType = {
    label: string,
    recordingObject: any,
    recordingUri: string,
    sortingObject: any,
    sortingUri: string
}

const ExampleRecordingSortingsTable: FunctionComponent<Props> = ({examples, onExampleSelected}) => {
    const columns = useMemo(() => ([
        {
            key: 'label',
            label: 'Example'
        }
    ]), [])
    const rows = useMemo(() => (
        examples.map((x, i)=> ({
            key: i + '',
            columnValues: {
                label: {
                    text: x.label,
                    element: <Hyperlink onClick={() => {onExampleSelected(x)}}>{x.label}</Hyperlink>
                }
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

export default ExampleRecordingSortingsTable