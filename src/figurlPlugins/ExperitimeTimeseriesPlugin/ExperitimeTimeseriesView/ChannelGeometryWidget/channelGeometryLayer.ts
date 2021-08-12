import { CanvasPainter } from 'figurl/labbox-react/components/CanvasWidget/CanvasPainter';
import { CanvasDragEvent, CanvasWidgetLayer, ClickEvent, ClickEventType, DiscreteMouseEventHandler, DragHandler } from 'figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer';
import { pointIsInEllipse, RectangularRegion, rectangularRegionsIntersect } from 'figurl/labbox-react/components/CanvasWidget/Geometry';
import { TimeseriesSelection, TimeseriesSelectionDispatch } from 'figurlPlugins/ExperitimeTimeseriesPlugin/interface/TimeseriesSelection';
import { ActionItem, DividerItem } from 'python/sortingview/gui/extensions/common/Toolbars';
import setupChannelBoxes, { ChannelBox } from './setupChannelBoxes';

export type ChannelGeometryLayerProps = {
    layoutMode: 'geom' | 'vertical'
    channelNames: string[]
    channelLocations: number[][]
    samplingFrequency: number
    width: number
    height: number
    selection?: TimeseriesSelection
    selectionDispatch?: TimeseriesSelectionDispatch
    channelOpts: ChannelOpts
    customActions?: (ActionItem | DividerItem)[]
}

export type ChannelOpts = {
    colors?: ChannelColors
    showLabels?: boolean
    disableSelection?: boolean
    maxChannelBoxPixelRadius?: number
}


export type ChannelColors = {
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
    channelBoxes: ChannelBox[]
    radius: number
    pixelRadius: number
    dragRegion: RectangularRegion | null
    draggedChannelNames: string[]
    hoveredChannelName: string | null
}
const initialLayerState = {
    channelBoxes: [],
    radius: 0,
    pixelRadius: 0,
    dragRegion: null,
    draggedChannelNames: [],
    hoveredChannelName: null
}

const defaultColors: ChannelColors = {
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

const handleClick: DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<ChannelGeometryLayerProps, LayerState>) => {
    if (event.type !== ClickEventType.Release) return
    const { selectionDispatch, channelOpts: opts } = layer.getProps()
    if (opts.disableSelection) return
    const state = layer.getState()
    if (state === null) return
    const hitIds = state.channelBoxes.filter((r) => pointIsInEllipse(event.point, [r.x, r.y], state.radius)).map(r => r.id)
    // handle clicks that weren't on a channel box
    if (hitIds.length === 0) {
        if (!(event.modifiers.ctrl || event.modifiers.shift || state.dragRegion)) {
            // simple-click that doesn't select anything should deselect everything. Shift- or Ctrl-clicks on empty space do nothing.
            selectionDispatch && selectionDispatch({type: 'SetSelectedChannelNames', selectedChannelNames: []})
        }
        return
    }
    // Our definition of radius precludes any two channel boxes from overlapping, so hitIds should have 0 or 1 elements.
    // Since we've already handled the case where it's 0, now it must be 1.
    const hitId = hitIds[0]
    
    const currentSelection = layer.getProps().selection?.selectedChannelNames || []
    const newSelection = event.modifiers.ctrl  // ctrl-click: toggle state of clicked item
                            ? currentSelection.includes(hitId)
                                ? currentSelection.filter(id => id !== hitId)
                                : [...currentSelection, hitId]
                            : event.modifiers.shift
                                ? [...currentSelection, hitId] // shift-click: add selected item unconditionally
                                : [hitId] // simple click: clear all selections except clicked item
    selectionDispatch && selectionDispatch({type: 'SetSelectedChannelNames', selectedChannelNames: newSelection})
    layer.scheduleRepaint()
}

const handleHover: DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<ChannelGeometryLayerProps, LayerState>) => {
    if (event.type !== ClickEventType.Move) return
    const state = layer.getState()
    if (state === null) return
    const hoveredIds = state.channelBoxes.filter((r) => pointIsInEllipse(event.point, [r.x, r.y], state.radius)).map(r => r.id)
    layer.setState({...state, hoveredChannelName: hoveredIds.length === 0 ? null : hoveredIds[0]})
    layer.scheduleRepaint()
}

const handleDragSelect: DragHandler = (layer: CanvasWidgetLayer<ChannelGeometryLayerProps, LayerState>, drag: CanvasDragEvent) => {
    const state = layer.getState()
    const { selectionDispatch, channelOpts: opts } = layer.getProps()
    if (opts.disableSelection) return
    if (state === null) return // state not set; can't happen but keeps linter happy
    const hits = state.channelBoxes.filter((r) => rectangularRegionsIntersect(r.rect, drag.dragRect)) ?? []
    if (drag.released) {
        const currentSelected = drag.shift ? layer.getProps()?.selection?.selectedChannelNames ?? [] : []
        selectionDispatch && selectionDispatch({type: 'SetSelectedChannelNames', selectedChannelNames: [...currentSelected, ...hits.map(r => r.id)]})
        layer.setState({...state, dragRegion: null, draggedChannelNames: []})
    } else {
        layer.setState({...state, dragRegion: drag.dragRect, draggedChannelNames: hits.map(r => r.id)})
    }
    layer.scheduleRepaint()
}

export const createChannelGeometryLayer = () => {
    const onPaint = (painter: CanvasPainter, props: ChannelGeometryLayerProps, state: LayerState) => {
        const opts = props.channelOpts
        const colors = opts.colors || defaultColors
        const showLabels = opts.showLabels
        painter.wipe()
        const useLabels = state.pixelRadius > 5
        for (let e of state.channelBoxes) {
            const selected = (!opts.disableSelection) && (props.selection?.selectedChannelNames?.includes(e.id) || false)
            const hovered = (!opts.disableSelection) && (state.hoveredChannelName === e.id)
            const dragged = (!opts.disableSelection) && (state.draggedChannelNames?.includes(e.id) || false)
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
            if (layoutMode === 'geom') {
                painter.fillEllipse(e.rect, {color: color})
                painter.drawEllipse(e.rect, {color: colors.border})
            }
            else if (layoutMode === 'vertical') {
                painter.drawLine(e.rect.xmin, (e.rect.ymin + e.rect.ymax) / 2, e.rect.xmax, (e.rect.ymin + e.rect.ymax) / 2, {color: colors.border})
            }
            if (useLabels) {
                const fontColor = ([colors.selected, colors.draggedSelected, colors.hover, colors.selectedHover].includes(color)) ? colors.textDark : colors.textLight
                if (showLabels) {
                    painter.drawText({
                        rect: e.rect, 
                        alignment: {Horizontal: 'AlignCenter', Vertical: 'AlignCenter'}, 
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
    const onPropsChange = (layer: CanvasWidgetLayer<ChannelGeometryLayerProps, LayerState>, props: ChannelGeometryLayerProps) => {
        const state = layer.getState()
        const { width, height, channelLocations, channelNames, layoutMode } = props
        const { channelBoxes, transform, radius, pixelRadius } = setupChannelBoxes({width, height, channelLocations, channelNames, layoutMode, maxChannelBoxPixelRadius: props.channelOpts.maxChannelBoxPixelRadius})
        layer.setTransformMatrix(transform)
        layer.setState({...state, channelBoxes, radius, pixelRadius})
        layer.scheduleRepaint()
    }
    return new CanvasWidgetLayer<ChannelGeometryLayerProps, LayerState>(
        onPaint,
        onPropsChange,
        initialLayerState,
        {
            discreteMouseEventHandlers: [handleClick, handleHover],
            dragHandlers: [handleDragSelect],
        }
    )
}