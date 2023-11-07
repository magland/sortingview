import React, { FunctionComponent, useMemo } from 'react';
import { ConsoleViewData } from './ConsoleViewData';

type Props = {
    data: ConsoleViewData
    width: number
    height: number
}

const ConsoleView: FunctionComponent<Props> = ({data, width, height}) => {
    const {consoleLines} = data

    const divStyle: React.CSSProperties = useMemo(() => ({
        width: width - 20, // leave room for the scrollbar
        height,
        position: 'relative',
        overflowY: 'auto'
    }), [width, height])

    return (
        <div style={divStyle}>
            {
                consoleLines.map(x => (
                    <pre>{x.text}</pre>
                ))
            }
        </div>
    )
}

export default ConsoleView