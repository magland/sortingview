import React, { FunctionComponent, useMemo } from 'react';
import { ViewComponentProps } from 'libraries/core-view-component-props';
import { CompositeViewData } from './CompositeViewData';
import ViewWrapper from './ViewWrapper';

type Props = {
    data: CompositeViewData
    ViewComponent: FunctionComponent<ViewComponentProps>
    width: number
    height: number
}

const CompositeView: FunctionComponent<Props> = ({data, ViewComponent, width, height}) => {
    const divStyle: React.CSSProperties = useMemo(() => ({
        width,
        height,
        overflowX: 'hidden',
        overflowY: 'auto'
    }), [width, height])

    const H = (height - 80 * (data.views.length - 1)) / data.views.length
    
    return (
        <div style={divStyle}>
            {
                data.views.map((view, ii) => (
                    <div key={ii}>
                        <h3>{view.label}</h3>
                        <ViewWrapper
                            figureDataSha1={view.figureDataSha1} // old
                            figureDataUri={view.figureDataUri} // new
                            ViewComponent={ViewComponent}
                            width={width}
                            height={H}
                        />
                    </div>
                ))
            }
        </div>
    )
}

export default CompositeView