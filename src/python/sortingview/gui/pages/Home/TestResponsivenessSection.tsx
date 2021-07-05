import Expandable from 'labbox-react/components/Expandable/Expandable'
import React, { FunctionComponent } from 'react'
import TaskLatencyTest from './TaskLatencyTest'

type Props = {
    
}

const TestResponsivenessSection: FunctionComponent<Props> = () => {
    return (
        <div>
            <Expandable label="Test responsiveness">
                <h3>Test responsiveness of the task backend</h3>
                <TaskLatencyTest />
            </Expandable>
        </div>
    )
}

export default TestResponsivenessSection