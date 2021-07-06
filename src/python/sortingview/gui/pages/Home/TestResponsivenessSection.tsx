import Expandable from 'labbox-react/components/Expandable/Expandable'
import React, { FunctionComponent } from 'react'
import QueryLatencyTest from './QueryLatencyTest'
import SubfeedLatencyTest from './SubfeedLatencyTest'

type Props = {
    
}

const TestResponsivenessSection: FunctionComponent<Props> = () => {
    return (
        <div>
            <Expandable label="Test responsiveness">
                <h3>Test responsiveness of the task backend</h3>
                <p>Query test:</p>
                <QueryLatencyTest />
                <p>Subfeed test:</p>
                <SubfeedLatencyTest />
            </Expandable>
        </div>
    )
}

export default TestResponsivenessSection