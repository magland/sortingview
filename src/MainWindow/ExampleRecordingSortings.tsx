import React from 'react'
import { FunctionComponent } from "react"
import { useTask } from '../python/sortingview/gui/labbox'
import ExampleRecordingSortingsTable, { ExampleRecordingSortingType } from './ExampleRecordingSortingsTable'

type Props = {
    onExampleSelected: (a: ExampleRecordingSortingType) => void
}

const ExampleRecordingSortings: FunctionComponent<Props> = ({onExampleSelected}) => {
    const {returnValue: examples, task} = useTask<ExampleRecordingSortingType[]>('example_recording_sortings', {cachebust: '6'})
    return (
        <div>
            {
                examples ? (
                    <ExampleRecordingSortingsTable
                        examples={examples}
                        onExampleSelected={onExampleSelected}
                    />
                ) : task?.status === 'error' ? (
                    <span>Error: {task.errorMessage}</span>
                ) :
                (
                    <span>Loading examples</span>
                )
            }
        </div>
    )
}

export default ExampleRecordingSortings