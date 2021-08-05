import { CanvasPainter } from "figurl/labbox-react/components/CanvasWidget/CanvasPainter";
import { CanvasDragEvent, CanvasWidgetLayer, ClickEvent, ClickEventType, DiscreteMouseEventHandler, DragHandler } from "figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer";
import { pointIsInEllipse, RectangularRegion, rectangularRegionsIntersect } from "figurl/labbox-react/components/CanvasWidget/Geometry";
import setupElectrodes, { ElectrodeBox } from './setupElectrodes';
import { ElectrodeLayerProps } from './WaveformWidget';

export type ElectrodeColors = {
    border: string,
    base: string,
    selected: string,
    hover: string,
    selectedHover: string,
    dragged: string,
    draggedSelected: string,
    dragRect: string,
    textLight: string,
    textDark: string
}
type LayerState = {
    electrodeBoxes: ElectrodeBox[]
    radius: number
    pixelRadius: number
    dragRegion: RectangularRegion | null
    draggedElectrodeIds: number[]
    hoveredElectrodeId: number | null
}
const initialLayerState = {
    electrodeBoxes: [],
    radius: 0,
    pixelRadius: 0,
    dragRegion: null,
    draggedElectrodeIds: [],
    hoveredElectrodeId: null
}

const defaultColors: ElectrodeColors = {
    border: 'rgb(30, 30, 30)',
    base: 'rgb(0, 0, 255)',
    selected: 'rgb(196, 196, 128)',
    hover: 'rgb(128, 128, 255)',
    selectedHover: 'rgb(200, 200, 196)',
    dragged: 'rgb(0, 0, 196)',
    draggedSelected: 'rgb(180, 180, 150)',
    dragRect: 'rgba(196, 196, 196, 0.5)',
    textLight: 'rgb(228, 228, 228)',
    textDark: 'rgb(32, 32, 32)'
}

const handleClick: DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<ElectrodeLayerProps, LayerState>) => {
    if (event.type !== ClickEventType.Release) return
    const { selectionDispatch, electrodeOpts: opts }: ElectrodeLayerProps = layer.getProps()
    if (opts.disableSelection) return
    const state = layer.getState()
    if (state === null) return
    const hitIds = state.electrodeBoxes.filter((r) => pointIsInEllipse(event.point, [r.x, r.y], state.radius)).map(r => r.id)
    // handle clicks that weren't on an electrode
    if (hitIds.length === 0) {
        if (!(event.modifiers.ctrl || event.modifiers.shift || state.dragRegion)) {
            // simple-click that doesn't select anything should deselect everything. Shift- or Ctrl-clicks on empty space do nothing.
            selectionDispatch({type: 'SetSelectedElectrodeIds', selectedElectrodeIds: []})
        }
        return
    }
    // Our definition of radius precludes any two electrodes from overlapping, so hitIds should have 0 or 1 elements.
    // Since we've already handled the case where it's 0, now it must be 1.
    const hitId = hitIds[0]
    
    const currentSelection = layer.getProps().selection.selectedElectrodeIds || []
    const newSelection = event.modifiers.ctrl  // ctrl-click: toggle state of clicked item
                            ? currentSelection.includes(hitId)
                                ? currentSelection.filter(id => id !== hitId)
                                : [...currentSelection, hitId]
                            : event.modifiers.shift
                                ? [...currentSelection, hitId] // shift-click: add selected item unconditionally
                                : [hitId] // simple click: clear all selections except clicked item
    selectionDispatch({type: 'SetSelectedElectrodeIds', selectedElectrodeIds: newSelection})
    layer.scheduleRepaint()
}

const handleHover: DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<ElectrodeLayerProps, LayerState>) => {
    if (event.type !== ClickEventType.Move) return
    const state = layer.getState()
    if (state === null) return
    const hoveredIds = state.electrodeBoxes.filter((r) => pointIsInEllipse(event.point, [r.x, r.y], state.radius)).map(r => r.id)
    layer.setState({...state, hoveredElectrodeId: hoveredIds.length === 0 ? null : hoveredIds[0]})
    layer.scheduleRepaint()
}

const handleDragSelect: DragHandler = (layer: CanvasWidgetLayer<ElectrodeLayerProps, LayerState>, drag: CanvasDragEvent) => {
    const state = layer.getState()
    const { selectionDispatch, electrodeOpts: opts } = layer.getProps()
    if (opts.disableSelection) return
    if (state === null) return // state not set; can't happen but keeps linter happy
    const hits = state.electrodeBoxes.filter((r) => rectangularRegionsIntersect(r.rect, drag.dragRect)) ?? []
    if (drag.released) {
        const currentSelected = drag.shift ? layer.getProps()?.selection.selectedElectrodeIds ?? [] : []
        selectionDispatch({type: 'SetSelectedElectrodeIds', selectedElectrodeIds: [...currentSelected, ...hits.map(r => r.id)]})
        layer.setState({...state, dragRegion: null, draggedElectrodeIds: []})
    } else {
        layer.setState({...state, dragRegion: drag.dragRect, draggedElectrodeIds: hits.map(r => r.id)})
    }
    layer.scheduleRepaint()
}

export const createElectrodesLayer = () => {
    const onPaint = (painter: CanvasPainter, props: ElectrodeLayerProps, state: LayerState) => {
        const opts = props.electrodeOpts
        const colors = opts.colors || defaultColors
        const showLabels = opts.showLabels
        const offsetLabels = opts.offsetLabels
        const hideElectrodes = opts.hideElectrodes
        painter.wipe()
        const useLabels = state.pixelRadius > 5
        for (let e of state.electrodeBoxes) {
            const selected = (!opts.disableSelection) && (props.selection.selectedElectrodeIds?.includes(e.id) || false)
            const hovered = (!opts.disableSelection) && (state.hoveredElectrodeId === e.id)
            const dragged = (!opts.disableSelection) && (state.draggedElectrodeIds?.includes(e.id) || false)
            const color = selected 
                            ? dragged
                                ? colors.draggedSelected
                                : hovered
                                    ? colors.selectedHover
                                    : colors.selectedHover
                            : dragged
                                ? colors.dragged
                                : hovered
                                    ? colors.hover
                                    : colors.base
            const layoutMode = props.layoutMode
            if (!hideElectrodes) {
                if (layoutMode === 'geom') {
                    painter.fillEllipse(e.rect, {color: color})
                    painter.drawEllipse(e.rect, {color: colors.border})
                }
                else if (layoutMode === 'vertical') {
                    painter.drawLine(e.rect.xmin, (e.rect.ymin + e.rect.ymax) / 2, e.rect.xmax, (e.rect.ymin + e.rect.ymax) / 2, {color: colors.border})
                }
            }
            if (useLabels) {
                const fontColor = ([colors.selected, colors.draggedSelected, colors.hover, colors.selectedHover].includes(color)) ? colors.textDark : colors.textLight
                if (showLabels) {
                    painter.drawText({
                        rect: offsetLabels ? offsetRectForLabel(e.rect) : e.rect, 
                        alignment: {Horizontal: offsetLabels ? 'AlignRight' : 'AlignCenter', Vertical: offsetLabels ? 'AlignBottom' : 'AlignCenter'}, 
                        font: {pixelSize: state.pixelRadius, family: 'Arial'},
                        pen: {color: fontColor},
                        brush: {color: fontColor},
                        text: e.label
                    })
                }
            }
        }
        
        state.dragRegion && painter.fillRect(state.dragRegion, {color: colors.dragRect})
    }
    const onPropsChange = (layer: CanvasWidgetLayer<ElectrodeLayerProps, LayerState>, props: ElectrodeLayerProps) => {
        const state = layer.getState()
        const { width, height, electrodeLocations, electrodeIds, layoutMode } = props
        const { electrodeBoxes, transform, radius, pixelRadius } = setupElectrodes({width, height, electrodeLocations, electrodeIds, layoutMode, maxElectrodePixelRadius: props.electrodeOpts.maxElectrodePixelRadius})
        layer.setTransformMatrix(transform)
        layer.setState({...state, electrodeBoxes, radius, pixelRadius})
        layer.scheduleRepaint()
    }
    return new CanvasWidgetLayer<ElectrodeLayerProps, LayerState>(
        onPaint,
        onPropsChange,
        initialLayerState,
        {
            discreteMouseEventHandlers: [handleClick, handleHover],
            dragHandlers: [handleDragSelect],
        }
    )
}

const offsetRectForLabel = (R: RectangularRegion): RectangularRegion => {
    const xspan = R.xmax - R.xmin
    const yspan = R.ymax - R.ymin
    return {
        xmin: R.xmin - xspan * 0.9,
        xmax: R.xmax - xspan * 0.9,
        ymin: R.ymin - yspan * 0.7,
        ymax: R.ymax - yspan * 0.7
    }
}