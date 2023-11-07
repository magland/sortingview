import { BaseCanvas } from '../figurl-canvas';
import { FunctionComponent } from 'react';
import { Margins, ScatterPlotMarker } from './ScatterPlot';

type Props = {
    markers: ScatterPlotMarker[]
    margins: Margins
    coord2Pixel: (p: {x: number, y: number}) => {x: number, y: number}
    width: number
    height: number
}

const draw = (context: CanvasRenderingContext2D, data: Props) => {
    context.clearRect(0, 0, data.width, data.height)
    
    data.markers.forEach(m => {
        const p = data.coord2Pixel({x: m.x, y: m.y})
        context.fillStyle = m.color
        context.strokeStyle = 'black'
        context.beginPath()
        context.ellipse(p.x, p.y, m.radius, m.radius, 0, 0, 2 * Math.PI)
        context.fill()
        context.stroke()
    })
}

const ScatterPlotMainLayer: FunctionComponent<Props> = (props) => {
    return (
        <BaseCanvas
            width={props.width}
            height={props.height}
            draw={draw}
            drawData={props}
        />
    )
}

export default ScatterPlotMainLayer