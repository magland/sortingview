import { useEffect, useState } from 'react'
import { CanvasPainter, Context2D } from './CanvasPainter'
import { getInverseTransformationMatrix, RectangularRegion, TransformationMatrix, transformPoint, transformRect, transformXY, Vec2 } from './Geometry'

type OnPaint<T extends BaseLayerProps, T2 extends object> = (painter: CanvasPainter, layerProps: T, state: T2) => Promise<void> | void
type OnPropsChange<T extends BaseLayerProps> = (layer: CanvasWidgetLayer<T, any>, layerProps: T) => void

export interface BaseLayerProps {
    width: number
    height: number
}

// Events-handling stuff should probably go somewhere else
export interface ClickEvent {
    point: Vec2,
    mouseButton: number,
    modifiers: ClickEventModifiers,
    type: ClickEventType
}

export interface ClickEventModifiers {
    alt?: boolean,
    ctrl?: boolean,
    shift?: boolean
}

export enum ClickEventType {
    Move = 'MOVE',
    Press = 'PRESS',
    Release = 'RELEASE'
}
export type ClickEventTypeStrings = keyof typeof ClickEventType

export interface CanvasDragEvent {
    dragRect: RectangularRegion,
    released: boolean,
    shift: boolean, // might extend this to the full modifier set later
    anchor?: Vec2,
    position?: Vec2
}

export interface KeyboardEvent {
    type: KeyEventType,
    keyCode: number
}

export enum KeyEventType {
    Press = 'PRESS',
    Release = 'RELEASE'
}

export interface MousePresenceEvent {
    type: MousePresenceEventType
}

export enum MousePresenceEventType {
    Enter = 'ENTER',
    Leave = 'LEAVE',
    Out = 'OUT'
}

export interface WheelEvent {
    deltaY: number
}


// These two handlers, and the EventHandlerSet, could all instead have parameterized types.
// But I couldn't figure out how to make the inheritance work right, so I bagged it.
// Reader, know that the layer in question ought to be a self-reference for the layer that owns the handler:
// this allows the handler functions to modify the parent function state without having direct reference
// to values outside their own scope.
export type DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<any, any>) => void
export type DragHandler = (layer: CanvasWidgetLayer<any, any>,  dragEvent: CanvasDragEvent) => void
export type KeyboardEventHandler = (event: KeyboardEvent, layer: CanvasWidgetLayer<any, any>) => boolean // return false to prevent default
export type MousePresenceEventHandler = (event: MousePresenceEvent, layer: CanvasWidgetLayer<any, any>) => void
export type WheelEventHandler = (event: WheelEvent, layer: CanvasWidgetLayer<any, any>) => void

export interface EventHandlerSet {
    discreteMouseEventHandlers?: DiscreteMouseEventHandler[],
    dragHandlers?:   DragHandler[],
    keyboardEventHandlers?: KeyboardEventHandler[],
    mousePresenceEventHandlers?: MousePresenceEventHandler[],
    wheelEventHandlers?: WheelEventHandler[]
}

export const formClickEventFromMouseEvent = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, t: ClickEventType, i?: TransformationMatrix): ClickEvent => {
    const element = e.currentTarget
    let point: Vec2 = [e.clientX - element.getBoundingClientRect().x, e.clientY - element.getBoundingClientRect().y]
    if (i) {
        const pointH = transformXY(i, point[0], point[1])
        point = [pointH[0], pointH[1]]
    }
    const modifiers = {
        alt: e.altKey,
        ctrl: e.ctrlKey || e.metaKey,
        shift: e.shiftKey,
    }
    return {point: [point[0], point[1]], mouseButton: e.buttons, modifiers: modifiers, type: t}
}

export const formWheelEvent = (e: React.WheelEvent<HTMLCanvasElement>): WheelEvent => {
    return {
        deltaY: e.deltaY
    }
}

export const formKeyboardEvent = (type: KeyEventType, e: React.KeyboardEvent<HTMLDivElement>): KeyboardEvent => {
    return {
        type,
        keyCode: e.keyCode
    }
}

export class CanvasWidgetLayer<LayerProps extends BaseLayerProps, State extends object> {
    _onPaint: OnPaint<LayerProps, State>
    _onPropsChange: OnPropsChange<LayerProps>
    _runningOnPropsChange = false

    _props: LayerProps | null = null // this will be null until props are passed in from the CanvasWidget
    _state: State

    // these will be null until they are set by the CanvasWidget
    _pixelWidth: number | null = null
    _pixelHeight: number | null = null
    _canvasElement: HTMLCanvasElement | null = null

    _transformMatrix: TransformationMatrix // coords to pixels
    _inverseMatrix: TransformationMatrix // pixels to coords

    _repaintScheduled = false
    _lastRepaintTimestamp = Number(new Date())

    _discreteMouseEventHandlers: DiscreteMouseEventHandler[] = []
    _dragHandlers: DragHandler[] = []
    _keyboardEventHandlers: KeyboardEventHandler[] = []
    _mousePresenceEventHandlers: MousePresenceEventHandler[] = []
    _wheelEventHandlers: WheelEventHandler[] = []

    _refreshRate = 120 // Hz

    constructor(onPaint: OnPaint<LayerProps, State>, onPropsChange: OnPropsChange<LayerProps>, initialState: State, handlers?: EventHandlerSet) {
        this._state = initialState
        this._onPaint = onPaint
        this._onPropsChange = onPropsChange
        this._discreteMouseEventHandlers = handlers?.discreteMouseEventHandlers || []
        this._dragHandlers = handlers?.dragHandlers || []
        this._keyboardEventHandlers = handlers?.keyboardEventHandlers || []
        this._mousePresenceEventHandlers = handlers?.mousePresenceEventHandlers || []
        this._wheelEventHandlers = handlers?.wheelEventHandlers || []
        this._transformMatrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as any as TransformationMatrix
        this._inverseMatrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as any as TransformationMatrix
    }
    getProps() {
        if (!this._props) throw Error('getProps must not be called before initial props are set')
        return this._props
    }
    setProps(p: LayerProps) { // this should either be called inside the useLayer hook or in the render method of the parent to the CanvasWidget
        if (this._runningOnPropsChange) {
            throw Error('Calling setProps inside onPropsChange is not allowed.')
        }
        if ((this._props === null) || (!shallowEqual(this._props, p))) {
            this._props = p
            this._pixelWidth = p.width
            this._pixelHeight = p.height
            this._runningOnPropsChange = true
            try {
                this._onPropsChange(this, p)
            }
            finally {
                this._runningOnPropsChange = false
            }
        }
    }
    getState() {
        return this._state
    }
    setState(s: State) {
        this._state = s
    }
    getTransformMatrix() {
        return this._transformMatrix
    }
    setTransformMatrix(t: TransformationMatrix) {
        this._transformMatrix = t
        try {
            this._inverseMatrix = getInverseTransformationMatrix(t)
        }
        catch(err) {
            console.warn(err)
            console.warn('WARNING: problem getting inverse transformation matrix')
            this._inverseMatrix = t
        }
    }
    pixelWidth() {
        if (this._pixelWidth === null) throw Error('Cannot get pixelWidth before it is set')
        return this._pixelWidth
    }
    pixelHeight() {
        if (this._pixelHeight === null) throw Error('Cannot get pixelHeight before it is set')
        return this._pixelHeight
    }
    resetCanvasElement(canvasElement: any) {
        this._canvasElement = canvasElement
    }
    canvasElement() {
        return this._canvasElement
    }
    refreshRate() {
        return this._refreshRate
    }
    setRefreshRate(hz: number) {
        this._refreshRate = hz
    }
    scheduleRepaint() {
        if (this._repaintScheduled) {
            return;
        }
        const elapsedSinceLastRepaint =  Number(new Date()) - this._lastRepaintTimestamp
        const refreshDelay = 1000 / this._refreshRate
        if (elapsedSinceLastRepaint > refreshDelay * 2) {
            // do it right away
            this._doRepaint();
            return;
        }
        this._repaintScheduled = true;
        // const timer = Number(new Date())                 // unused
        setTimeout(() => {
            // let elapsed = Number(new Date()) - timer;    // unused
            this._repaintScheduled = false;
            this._doRepaint();
        }, refreshDelay) // this timeout controls the refresh rate
    }
    repaintImmediate() {
        this._doRepaint()
    }
    async _doRepaint() {
        const context: Context2D | null = this._canvasElement?.getContext('2d') ?? null
        if (!context) return
        if ((this._pixelWidth === null) || (this._pixelHeight === null)) return
        let painter = new CanvasPainter(context, this._pixelWidth, this._pixelHeight, this._transformMatrix)
        // painter.clear()
        // _onPaint may or may not be async
        const promise = this._onPaint(painter, this._props as LayerProps, this._state as State)
        if (promise) {
            // if returned a promise, it was async, and let's await
            // in this case we should update the lastRepaintTimestamp both before and after the paint
            this._lastRepaintTimestamp = Number(new Date())
            await promise
        }
        // this.unclipToSelf(ctx)
        this._lastRepaintTimestamp = Number(new Date())
    }

    handleDiscreteEvent(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, type: ClickEventType) {
        if (this._discreteMouseEventHandlers.length === 0) return
        const click = formClickEventFromMouseEvent(e, type, this._inverseMatrix)
        // Don't respond to events outside the layer
        // NB possible minor efficiency gain if we cache our bounding coordinates in pixelspace.
        // if (!pointInRect(click.point, this.getCoordRange())) return
        for (let fn of this._discreteMouseEventHandlers) {
            fn(click, this)
        }
    }

    handleDrag(pixelDragRect: RectangularRegion, released: boolean, shift?: boolean, pixelAnchor?: Vec2, pixelPosition?: Vec2) {
        if (this._dragHandlers.length === 0) return
        const coordDragRect = transformRect(this._inverseMatrix, pixelDragRect)
        // if (!rectangularRegionsIntersect(coordDragRect, this.getCoordRange())) return // short-circuit if event is nothing to do with us
        // Note: append a 1 to make the Vec2s into Vec2Hs
        const coordAnchor = pixelAnchor ? transformPoint(this._inverseMatrix, [...pixelAnchor, 1]) : undefined
        const coordPosition = pixelPosition ? transformPoint(this._inverseMatrix, [...pixelPosition, 1]) : undefined
        for (let fn of this._dragHandlers) {
            fn(this, {dragRect: coordDragRect, released: released, shift: shift || false, anchor: coordAnchor, position: coordPosition})
        }
    }

    handleKeyboardEvent(type: KeyEventType, e: React.KeyboardEvent<HTMLDivElement>): boolean {
        if (this._keyboardEventHandlers.length === 0) return true
        const keyboardEvent = formKeyboardEvent(type, e)
        let passEventBackToUi = true
        for (let fn of this._keyboardEventHandlers) {
            if (fn(keyboardEvent, this) === false)
                passEventBackToUi = false
        }
        return passEventBackToUi
    }

    handleMousePresenceEvent(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, type: MousePresenceEventType) {
        if (this._mousePresenceEventHandlers.length === 0) return
        const presenceEvent = { type: type }
        for (let fn of this._mousePresenceEventHandlers) {
            fn(presenceEvent, this)
        }
    }

    handleWheelEvent(e: React.WheelEvent<HTMLCanvasElement>) {
        if (this._wheelEventHandlers.length === 0) return
        
        const wheelEvent = formWheelEvent(e)
        for (let fn of this._wheelEventHandlers) {
            fn(wheelEvent, this)
        }
    }
}

export const useLayer = <LayerProps extends BaseLayerProps, LayerState extends Object>(createLayer: () => CanvasWidgetLayer<LayerProps, LayerState>, layerProps?: LayerProps): CanvasWidgetLayer<LayerProps, LayerState> | null => {
    const [layer, setLayer] = useState<CanvasWidgetLayer<LayerProps, LayerState> | null>(null)
    useEffect(() => {
        if (layer === null) {
            setLayer(createLayer())
        }
    }, [layer, setLayer, createLayer])
    if ((layer) && (layerProps)) {
        layer.setProps(layerProps)
    }
    return layer
}

const listsMatch = (list1: any[], list2: any[]) => {
    if (list1.length !== list2.length) return false
    for (let i = 0; i < list1.length; i++) {
        if (list1[i] !== list2[i]) return false
    }
    return true
}

export const useLayers = (layers: (CanvasWidgetLayer<any, any> | null)[]) => {
    const [prevLayers, setPrevLayers] = useState<(CanvasWidgetLayer<any, any> | null)[]>([])
    if (listsMatch(prevLayers, layers)) {
        return prevLayers
    }
    else {
        setPrevLayers(layers)
        return layers
    }
}

// export const useLayers = <LayerProps extends BaseLayerProps>(layerList: (CanvasWidgetLayer<LayerProps, any> | null)[]): CanvasWidgetLayer<LayerProps, any>[] | null => {
//     const [layers, setLayers] = useState<CanvasWidgetLayer<LayerProps, Object>[] | null>(null)
//     useEffect(() => {
//         if (layers === null) {
//             if (layerList.filter(L => (L === null)).length === 0) {
//                 const layerList2: CanvasWidgetLayer<LayerProps, any>[] = []
//                 layerList.forEach(L => {
//                     if (L === null) throw Error('Unexpected null layer')
//                     layerList2.push(L)
//                 })
//                 setLayers(layerList2)
//             }
//         }
//     }, [layers, setLayers, layerList])
//     return layers
// }

const shallowEqual = (x: {[key: string]: any}, y: {[key: string]: any}) => {
    for (let k in x) {
        if (x[k] !== y[k]) {
            return false
        }
    }
    for (let k in y) {
        if (x[k] !== y[k]) {
            return false
        }
    }
    return true
}