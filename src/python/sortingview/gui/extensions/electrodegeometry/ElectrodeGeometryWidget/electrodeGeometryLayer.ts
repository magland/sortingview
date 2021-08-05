import { norm } from "mathjs"
import { funcToTransform } from "figurl/labbox-react/components/CanvasWidget"
import { CanvasPainter } from "figurl/labbox-react/components/CanvasWidget/CanvasPainter"
import { CanvasDragEvent, CanvasWidgetLayer, ClickEvent, ClickEventType, DiscreteMouseEventHandler, DragHandler } from "figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer"
import { getBoundingBoxForEllipse, getHeight, getWidth, pointIsInEllipse, RectangularRegion, rectangularRegionsIntersect, transformDistance, Vec2 } from "figurl/labbox-react/components/CanvasWidget/Geometry"
import { getArrayMax, getArrayMin } from "../../common/utility"

interface ElectrodeBoundingBox extends Electrode {
    id: number,
    br: RectangularRegion
}

const Color = {
    BASE: 'rgb(0, 0, 255)',
    SELECTED: 'rgb(196, 196, 128)',
    HOVER: 'rgb(128, 128, 255)',
    SELECTEDHOVER: 'rgb(200, 200, 196)',
    DRAGGED: 'rgb(0, 0, 196)',
    DRAGGEDSELECTED: 'rgb(180, 180, 150)',
    DRAGRECT: 'rgba(196, 196, 196, 0.5)'
}
const TextColor = {
    LIGHT: 'rgb(228, 228, 228)',
    DARK: 'rgb(32, 32, 32)'
}

export type Electrode = {
    id: number
    label: string,
    x: number,
    y: number,
    color?: string
}

export interface ElectrodeLayerProps {
    electrodes: Electrode[] // Note: these shouldn't be interacted with directly. Use the bounding boxes in the state, instead.
    selectedElectrodeIds: number[]
    onSelectedElectrodeIdsChanged: (x: number[]) => void
    width: number
    height: number
}

interface ElectrodeLayerState {
    electrodeBoundingBoxes: ElectrodeBoundingBox[]
    dragRegion: RectangularRegion | null
    draggedElectrodeIds: number[]
    hoveredElectrodeId: number | null
    radius: number
    pixelRadius: number
    lastProps: ElectrodeLayerProps
}

const initialElectrodeLayerState: ElectrodeLayerState = {
    electrodeBoundingBoxes: [],
    dragRegion: null,
    draggedElectrodeIds: [],
    hoveredElectrodeId: null,
    radius: 0,
    pixelRadius: 0,
    lastProps: {
        electrodes: [],
        selectedElectrodeIds: [],
        onSelectedElectrodeIdsChanged: () => {},
        width: 0,
        height: 0
    }
}

const computeRadiusCache = new Map<string, number>()
const computeRadius = (electrodes: Electrode[]): number => {
    const key = JSON.stringify(electrodes)
    const val = computeRadiusCache.get(key)
    if (val !== undefined) {
        return val
    }
    // how big should each electrode dot be? Really depends on how close
    // the dots are to each other. Let's find the closest pair of dots and
    // set the radius to 40% of the distance between them.
    let leastNorm = Number.MAX_VALUE
    electrodes.forEach((point) => {
        electrodes.forEach((otherPoint) => {
            const dist = norm([point.x - otherPoint.x, point.y - otherPoint.y])
            if (dist === 0) return
            leastNorm = Math.min(leastNorm, dist as number)
        })
    })
    // (might set a hard cap, but remember these numbers are in electrode-space coordinates)
    const radius = 0.4 * leastNorm
    computeRadiusCache.set(key, radius)
    return radius
}

const getElectrodesBoundingBox = (electrodes: Electrode[], radius: number): RectangularRegion => {
    return {
        xmin: getArrayMin(electrodes.map(e => (e.x))) - radius,
        xmax: getArrayMax(electrodes.map(e => (e.x))) + radius,
        ymin: getArrayMin(electrodes.map(e => (e.y))) - radius,
        ymax: getArrayMax(electrodes.map(e => (e.y))) + radius
    }
}

const onUpdateLayerProps = (layer: CanvasWidgetLayer<ElectrodeLayerProps, ElectrodeLayerState>, layerProps: ElectrodeLayerProps) => {
    // NOTE: Reorienting the electrode field depends on the fact that we never interact with the electrodes directly,
    // only their bounding boxes, which are computed here.
    // If that changes, we'll have to make further adjustments.
    const state = layer.getState()
    const { width, height, electrodes } = layerProps
    const W = width - 10 * 2 // compute canvas aspect ratio assuming a hard 10-pixel border
    const H = height - 10 * 2
    const canvasAspect = W / H


    const radius = computeRadius(electrodes)
    let boundingBox = getElectrodesBoundingBox(electrodes, radius)
    let boxAspect = getWidth(boundingBox) / getHeight(boundingBox)
    const aspectMismatch = ((boxAspect > 1) !== (canvasAspect > 1))

    let realizedElectrodes = electrodes
    if (aspectMismatch) {
        // if the two aspect ratios' relationship to 1 is different, then one is portrait
        // and the other landscape. We should then correct by rotating the electrode set 90 degrees.
        // note: a 90-degree right rotation in 2d makes x' = y and y' = -x
        realizedElectrodes = electrodes.map((electrode) => {
            return {...electrode, x: electrode.y, y: -electrode.x }
        })
        // and of course that also means resetting the x- and y-ranges of the bounding box.
        boundingBox = { xmin: boundingBox.ymin, xmax: boundingBox.ymax, ymin: -boundingBox.xmax, ymax: -boundingBox.xmin }
        boxAspect = getWidth(boundingBox) / getHeight(boundingBox)
    }

    let scaleFactor: number
    if (boxAspect > canvasAspect) {
        // we are constrained in width
        scaleFactor = W / getWidth(boundingBox)
    }
    else {
        // we are constrained in height
        scaleFactor = H / getHeight(boundingBox)
    }

    // We don't want to have big huge electrode circles if there are too few electrodes relative to the canvas.
    // To correct for this, adjust the scale factor downwards if it would result in an unacceptably large radius.
    const MAX_RADIUS_PIXELS = 32
    scaleFactor = Math.min(scaleFactor, MAX_RADIUS_PIXELS / radius)

    const xMargin = (width - getWidth(boundingBox) * scaleFactor) / 2
    const yMargin = (height - getHeight(boundingBox) * scaleFactor) / 2

    const transform = funcToTransform((p: Vec2): Vec2 => {
        const x = xMargin + (p[0] - boundingBox.xmin) * scaleFactor
        const y = yMargin + (p[1] - boundingBox.ymin) * scaleFactor
        return [x, y]
    })

    const electrodeBoxes = realizedElectrodes.map((e) => { 
        const x = e.x
        const y = e.y
        return { label: e.label, id: parseInt(e.label), x: x, y: y, br: getBoundingBoxForEllipse([x, y], radius, radius), color: e.color}}
    )

    layer.setTransformMatrix(transform)
    const pixelRadius = transformDistance(transform, [radius, 0])[0]
    layer.setState({...state, electrodeBoundingBoxes: electrodeBoxes, radius: radius, pixelRadius: pixelRadius, lastProps: layerProps})
    // layer.repaintImmediate()
    layer.scheduleRepaint()
}

const paintElectrodeGeometryLayer = (painter: CanvasPainter, props: ElectrodeLayerProps, state: ElectrodeLayerState) => {
    painter.wipe()
    const useLabels = state.pixelRadius > 5
    // The following three lines are visualizations to confirm the scaled image remains centered.
    // painter.fillWholeCanvas('rgb(224, 196, 224)')
    // const electrodesBoundngBox = getElectrodesBoundingBox(props.electrodes, 0)
    // painter.drawRect(electrodesBoundngBox, {color: 'black', width: 4})
    for (let e of state.electrodeBoundingBoxes) {
        const selected = props.selectedElectrodeIds?.includes(e.id) || false
        const hovered = state.hoveredElectrodeId === e.id
        const dragged = state.draggedElectrodeIds?.includes(e.id) || false
        const color = e.color || (
            selected 
                ? dragged
                    ? Color.DRAGGEDSELECTED
                    : hovered
                        ? Color.SELECTEDHOVER
                        : Color.SELECTED
                : dragged
                    ? Color.DRAGGED
                    : hovered
                        ? Color.HOVER
                        : Color.BASE
        )
        painter.fillEllipse(e.br, {color: color})
        if (useLabels) {
            const fontColor = ([Color.SELECTED, Color.DRAGGEDSELECTED, Color.HOVER, Color.SELECTEDHOVER].includes(color)) ? TextColor.DARK : TextColor.LIGHT
            painter.drawText({
                rect: e.br, 
                alignment: {Horizontal: 'AlignCenter', Vertical: 'AlignCenter'}, 
                font: {pixelSize: state.pixelRadius, family: 'Arial'},
                pen: {color: fontColor}, brush: {color: fontColor},
                text: e.label
            })
        }
    }

    state.dragRegion && painter.fillRect(state.dragRegion, {color: Color.DRAGRECT})
}

const handleDragSelect: DragHandler = (layer: CanvasWidgetLayer<ElectrodeLayerProps, ElectrodeLayerState>, drag: CanvasDragEvent) => {
    const state = layer.getState()
    if (state === null) return // state not set; can't happen but keeps linter happy
    const hits = state.electrodeBoundingBoxes.filter((r) => rectangularRegionsIntersect(r.br, drag.dragRect)) ?? []
    if (drag.released) {
        const currentSelected = drag.shift ? layer.getProps()?.selectedElectrodeIds ?? [] : []
        layer.getProps()?.onSelectedElectrodeIdsChanged([...currentSelected, ...hits.map(r => r.id)])
        layer.setState({...state, dragRegion: null, draggedElectrodeIds: []})
    } else {
        layer.setState({...state, dragRegion: drag.dragRect, draggedElectrodeIds: hits.map(r => r.id)})
    }
    layer.scheduleRepaint()
}

const handleClick: DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<ElectrodeLayerProps, ElectrodeLayerState>) => {
    if (event.type !== ClickEventType.Release) return
    const state = layer.getState()
    if (state === null) return
    const hitIds = state.electrodeBoundingBoxes.filter((r) => pointIsInEllipse(event.point, [r.x, r.y], state.radius)).map(r => r.id)
    // handle clicks that weren't on an electrode
    if (hitIds.length === 0) {
        if (!(event.modifiers.ctrl || event.modifiers.shift || state.dragRegion)) {
            // simple-click that doesn't select anything should deselect everything. Shift- or Ctrl-clicks on empty space do nothing.
            layer.getProps()?.onSelectedElectrodeIdsChanged([])
        }
        return
    }
    // Our definition of radius precludes any two electrodes from overlapping, so hitIds should have 0 or 1 elements.
    // Since we've already handled the case where it's 0, now it must be 1.
    const hitId = hitIds[0]
    
    const currentSelection = layer.getProps()?.selectedElectrodeIds || []
    const newSelection = event.modifiers.ctrl  // ctrl-click: toggle state of clicked item
                            ? currentSelection.includes(hitId)
                                ? currentSelection.filter(id => id !== hitId)
                                : [...currentSelection, hitId]
                            : event.modifiers.shift
                                ? [...currentSelection, hitId] // shift-click: add selected item unconditionally
                                : [hitId] // simple click: clear all selections except clicked item
    layer.getProps()?.onSelectedElectrodeIdsChanged(newSelection)
    layer.scheduleRepaint()
}

const handleHover: DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<ElectrodeLayerProps, ElectrodeLayerState>) => {
    if (event.type !== ClickEventType.Move) return
    const state = layer.getState()
    if (state === null) return
    const hoveredIds = state.electrodeBoundingBoxes.filter((r) => pointIsInEllipse(event.point, [r.x, r.y], state.radius)).map(r => r.id)
    layer.setState({...state, hoveredElectrodeId: hoveredIds.length === 0 ? null : hoveredIds[0]})
    layer.scheduleRepaint()
}

export const createElectrodeGeometryLayer = () => {
    return new CanvasWidgetLayer<ElectrodeLayerProps, ElectrodeLayerState>(
        paintElectrodeGeometryLayer,
        onUpdateLayerProps,
        initialElectrodeLayerState,
        {
            dragHandlers: [handleDragSelect],
            discreteMouseEventHandlers: [handleClick, handleHover]
        }
    )
}