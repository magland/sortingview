import React, { FunctionComponent, Suspense } from 'react';
import { isEqualTo, validateObject } from '../../core-utils';

const Plot = React.lazy(() => (import('react-plotly.js')))

export type PlotlyFigureViewData = {
    type: 'PlotlyFigure'
    fig: any
}
export const isPlotlyFigureViewData = (x: any): x is PlotlyFigureViewData => {
    return validateObject(x, {
        type: isEqualTo('PlotlyFigure'),
        fig: () => true
    })
}

type Props = {
    data: PlotlyFigureViewData
    width: number
    height: number
}

const PlotlyFigureView: FunctionComponent<Props> = ({data, width, height}) => {
    const {fig} = data
    return (
        <div style={{position: 'absolute', width, height}}>
            <Suspense fallback={<div>Loading plotly</div>}>
				<Plot
					data={fig.data}
					layout={{
                        ...fig.layout,
                        width: width,
                        height: height
                    }}
				/>
			</Suspense>
        </div>
    )
}

export default PlotlyFigureView