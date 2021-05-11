import React, { FunctionComponent } from 'react';
import { VerticalBarSeries, XAxis, XYPlot, YAxis } from 'react-vis';

interface Props {
    boxSize: {width: number, height: number}
    plotData: any | null
    argsObject: any
    title: string
}

const Correlogram_rv: FunctionComponent<Props> = ({boxSize, plotData, argsObject = {id: 0}, title}) => {
    // plotData will be an array of [x-vals], [y-vals], and x-stepsize.
    // need to convert to an array of objects with x-y pairs.
    // We'll be doing this a LOT, it belongs elsewhere
    if (!plotData) {
        return <div>No data</div>;
    }
    const data = plotData[0].map((item: number, index: number) => {
        return { x: item, y: plotData[1][index] };
    });

    const xAxisLabel = 'dt (msec)'

    return (
        <div className="App" key={"plot-"+argsObject.id}>
            <div style={{textAlign: 'center', fontSize: '12px'}}>{title}</div>
            <XYPlot
                margin={30}
                height={boxSize.height}
                width={boxSize.width}
            >
                <VerticalBarSeries data={data} barWidth={1} />
                <XAxis />
                <YAxis />
            </XYPlot>
            <div style={{textAlign: 'center', fontSize: '12px'}}>{xAxisLabel}</div>
        </div>
    );
}



export default Correlogram_rv;