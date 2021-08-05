import { funcToTransform } from "figurl/labbox-react/components/CanvasWidget"
import { CanvasPainter } from "figurl/labbox-react/components/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer, ClickEvent, ClickEventType, DiscreteMouseEventHandler } from "figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer"
import { pointIsInEllipse, RectangularRegion, Vec2 } from "figurl/labbox-react/components/CanvasWidget/Geometry"

export type ClusterLayerProps = {
    x: number[]
    y: number[]
    rect: RectangularRegion
    width: number
    height: number
    selectedIndex?: number
    onSelectedIndexChanged?: (i: number | undefined) => void
}

type ClusterLayerState = {
    hoverIndex?: number
}

const initialClusterLayerState = {}

const onUpdateLayerProps = (layer: CanvasWidgetLayer<ClusterLayerProps, ClusterLayerState>, layerProps: ClusterLayerProps) => {
    const { width, height, rect } = layerProps
    const xMargin = 5
    const yMargin = 5
    layer.setTransformMatrix(funcToTransform((p: Vec2): Vec2 => {
        const xfrac = ( p[0] - rect.xmin ) / (rect.xmax - rect.xmin)
        const yfrac = 1 - ( p[1] - rect.ymin ) / (rect.ymax - rect.ymin)
        const x = xMargin + xfrac * ( width - 2 * xMargin )
        const y = yMargin + yfrac * ( height - 2 * yMargin )
        return [x, y]
    }))
    layer.scheduleRepaint()
}

const paintLayer = (painter: CanvasPainter, props: ClusterLayerProps, state: ClusterLayerState) => {
    const { x, y, selectedIndex } = props
    
    painter.wipe()
    
    const n = x.length
    const pen = {color: 'black'}
    const brush = {color: 'blue'}
    for (let i = 0; i < n; i ++) {
        painter.drawMarker([x[i], y[i]], {radius: 2, pen, brush})
    }
    if (state.hoverIndex !== undefined) {
        const hi = state.hoverIndex
        const pen = {color: 'gray', width: 5}
        const brush = {color: 'blue'}
        painter.drawMarker([x[hi], y[hi]], {radius: 3, pen, brush})
    }

    if (selectedIndex !== undefined) {
        const si = selectedIndex
        const pen = {color: 'orange', width: 4}
        const brush = {color: 'blue'}
        painter.drawMarker([x[si], y[si]], {radius: 3, pen, brush})
    }
}

const getIndexAtPoint = (props: ClusterLayerProps, p: Vec2) => {
    const { x, y } = props
    const inds = x.map((x, ii) => (ii))
    const radius = 10 *  (props.rect.xmax - props.rect.xmin) / props.width
    const inds2 = inds.filter((ii: number) => (pointIsInEllipse(p, [x[ii], y[ii]], radius))).sort((i1: number, i2: number) => {
        const xdelta1 = x[i1] - p[0]
        const ydelta1 = y[i1] - p[1]
        const xdelta2 = x[i2] - p[0]
        const ydelta2 = y[i2] - p[1]
        const distsqr1 = xdelta1 * xdelta1 + ydelta1 * ydelta1
        const distsqr2 = xdelta2 * xdelta2 + ydelta2 * ydelta2
        return distsqr1 - distsqr2
    })
    return inds2[0]
}

const handleHover: DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<ClusterLayerProps, ClusterLayerState>) => {
    if (event.type !== ClickEventType.Move) return
    const state = layer.getState()
    const index = getIndexAtPoint(layer.getProps(), event.point)
    layer.setState({...state, hoverIndex: index})
    layer.scheduleRepaint()
}

const handleClick: DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<ClusterLayerProps, ClusterLayerState>) => {
    if (event.type !== ClickEventType.Release) return
    const { onSelectedIndexChanged } = layer.getProps()
    const index = getIndexAtPoint(layer.getProps(), event.point)
    onSelectedIndexChanged && onSelectedIndexChanged(index)
}

const createClusterLayer = () => {
    return new CanvasWidgetLayer<ClusterLayerProps, ClusterLayerState>(
        paintLayer,
        onUpdateLayerProps,
        initialClusterLayerState,
        {
            dragHandlers: [],
            discreteMouseEventHandlers: [handleHover, handleClick]
        }
    )
}

export default createClusterLayer