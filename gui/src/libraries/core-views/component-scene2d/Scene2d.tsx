import { BaseCanvas, pointInRect, RectangularRegion, Vec4 } from "../figurl-canvas";
import { dragSelectReducer } from "../../core-utils";
import { randomAlphaString } from "../../core-utils";
import React, { FunctionComponent, useCallback, useEffect, useReducer, useState } from "react";

// properties common to all Scene2dObject types
type Scene2dObjectCommon = {
	objectId: string // a unique ID for the object
	clickable?: boolean // the object is clickable
	draggable?: boolean // the object is mouse draggable
	selected?: boolean // the object is selected (affects appearance)
}

// Line object
type Scene2dLineObject = Scene2dObjectCommon & {
	type: 'line'
	x: number, y: number, // initial point
	dx: number, dy: number // terminal point is (x+dx, y+dy)
	attributes: {
		color: string // line color
		dash?: number[] // for example [4, 3] gives a dash that looks like ____   ____   ____   ____
		width?: number // line width
	}
	selectedAttributes?: { // optional attributes for when the line is selected - otherwise defaults apply
		color: string
		dash?: number[]
		width?: number
	}
}

// Marker object
type Scene2dMarkerObject = Scene2dObjectCommon & {
	type: 'marker'
	x: number, y: number // center of the marker
	attributes: {
		fillColor?: string // fill color
		lineColor?: string // line color
		shape?: 'circle' | 'square' // marker shape
		radius?: number // marker radius
	}
	selectedAttributes?: { // optional attributes for when the marker is selected - otherwise defaults apply
		fillColor?: string
		lineColor?: string
		shape?: 'circle' | 'square'
		radius?: number
	}
}

// Connector object (connecting two markers with a line)
type Scene2dConnectorObject = Scene2dObjectCommon & {
	type: 'connector',
	objectId1: string, objectId2: string, // object IDs for the two markers to connect
	attributes: {
		color: string // line color
		dash?: number[] // line dash
		width?: number // line width
	}
}

// Scene2d object type
export type Scene2dObject =
	Scene2dLineObject |
	Scene2dMarkerObject |
	Scene2dConnectorObject

type Props ={
	width: number
	height: number
	objects: Scene2dObject[] // list of objects in the scene

	// an object has been clicked
	onClickObject?: (objectId: string, e: React.MouseEvent) => void

	// an object has been dragged to a new position (only fires on mouse release)
	onDragObject?: (objectId: string, newPoint: {x: number, y: number}, e: React.MouseEvent) => void

	// objects have been selected by dragging a selection rect and releasing
	onSelectObjects?: (objectIds: string[], e: React.MouseEvent | undefined) => void

	// the canvas has been clicked, but not on a clickable object
	onClick?: (p: {x: number, y: number}, e: React.MouseEvent) => void
}

const emptyDrawData = {}

// The default radius for a marker object
const defaultMarkerRadius = 6

// The default width of a line or connector object
const defaultLineWidth = 1.1

// The state of dragging an object
type DraggingObjectState = {
	object?: Scene2dObject | null // object being dragged - null means we are dragging, but not an object
	newPoint?: {x: number, y: number} // new object location
}

// An action to dispatch on the dragging object state
type DraggingObjectAction = {
	type: 'start' // start dragging
	object: Scene2dObject | null
	point: {x: number, y: number}
} | {
	type: 'end' // stop dragging
} | {
	type: 'move' // move the object to a new location (affects newPoint)
	point: {x: number, y: number}
}

const draggingObjectReducer = (s: DraggingObjectState, a: DraggingObjectAction): DraggingObjectState => {
	if (a.type === 'start') {
		// start dragging an object
		return {...s, object: a.object, newPoint: a.point}
	}
	else if (a.type === 'end') {
		// stop dragging an object
		return {...s, object: undefined}
	}
	else if (a.type === 'move') {
		// drag move an object
		return {...s, newPoint: a.point}
	}
	else return s
}

const Scene2d: FunctionComponent<Props> = ({width, height, objects, onClickObject, onDragObject, onSelectObjects, onClick}) => {
	// The drag state (the dragSelectReducer is more generic and is defined elsewhere)
	const [dragState, dragStateDispatch] = useReducer(dragSelectReducer, {})

	// The dragging object state (tracks which object is being dragged and where)
	const [draggingObject, draggingObjectDispatch] = useReducer(draggingObjectReducer, {})

	// The select rect when dragging a rect for selection, not dragging an object
	const [activeSelectRect, setActiveSelectRect] = useState<Vec4 | undefined>()

	// The active mouse event, for purpose of passing to the event handlers (ctrlKey, shiftKey, etc)
	const [activeMouseEvent, setActiveMouseEvent] = useState<React.MouseEvent | undefined>()

	// handle a rect has been selected
	const handleSelectRect = useCallback((r: Vec4, e: React.MouseEvent | undefined) => {
		const rr = {xmin: r[0], ymin: r[1], xmax: r[0] + r[2], ymax: r[1] + r[3]}
		// find the IDs of all markers that are inside the select rect
		const objectIds = objects.filter(o => {
			if (o.type === 'marker') {
				if (pointInRect([o.x, o.y], rr)) {
					return true
				}
			}
			return false
		}).map(o => (o.objectId))
		// call the event handler
		onSelectObjects && onSelectObjects(objectIds, e)
	}, [objects, onSelectObjects])

	useEffect(() => {
		// dragState, activeSelectRect, or dragging object has changed
		if ((dragState.isActive) && (dragState.dragAnchor)) {
			// We are dragging
			if (draggingObject.object === undefined) {
				// we are not dragging an object (including null object - null means dragging but not an object)

				// find a draggable marker object at the drag anchor.
				// If found, dispatch a dragging object start action for this object
				// Otherwise, if not found, dispatch a start action for the null object
				const p = dragState.dragAnchor
				let found = false
				for (let i = objects.length - 1; i >= 0; i--) {
					const o = objects[i]
					if (o.draggable) {
						if (pointInObject(o, {x: p[0], y: p[1]})) {
							draggingObjectDispatch({type: 'start', object: o, point: {x: p[0], y: p[1]}})
							found = true
							break
						}
					}
				}
				if (!found) {
					draggingObjectDispatch({type: 'start', object: null, point: {x: 0, y: 0}})
				}
				///////////////////////////////////////////////////////////////////////////
			}
			else {
				// we are dragging an object (including null - null means dragging but not an object)
				const p = dragState.dragPosition
				if (p) {
					// report moved the dragging object
					draggingObjectDispatch({type: 'move', point: {x: p[0], y: p[1]}})
				}
				if (draggingObject.object === null) {
					// if we are dragging, but not an object, then set the active select rect
					setActiveSelectRect(dragState.dragRect)
				}
			}
		}
		else {
			// we are not dragging
			if (draggingObject.object !== undefined) {
				// but we were dragging before, so let's dispatch the end event
				draggingObjectDispatch({type: 'end'})
			}
			if (activeSelectRect) {
				// we had an active select rect, so let's call the select rect event handler
				handleSelectRect(activeSelectRect, activeMouseEvent)
				// and set the active select rect to undefined
				setActiveSelectRect(undefined)
			}
		}
	}, [dragState, activeSelectRect, activeMouseEvent, handleSelectRect, draggingObject.object, objects])

	// paint all the objects on the canvas
	const paint = useCallback((ctxt: CanvasRenderingContext2D, props: any) => {
		ctxt.clearRect(0, 0, width, height)
		const objectsById: {[id: string]: Scene2dObject} = {}
		for (let o of objects) objectsById[o.objectId] = o
		if ((!draggingObject.object) && (dragState.isActive) && (dragState.dragRect)) {
			const rect = dragState.dragRect
			ctxt.fillStyle = defaultDragStyle
            ctxt.fillRect(rect[0], rect[1], rect[2], rect[3])
		}
		const paintObject = (o: Scene2dObject) => {
			if ((o.type === 'line') || (o.type === 'marker')) {
				// draw a line or marker
				let pp = {x: o.x, y: o.y}
				if ((draggingObject) && (o.objectId === draggingObject.object?.objectId) && (draggingObject.newPoint)) {
					// use the new location if dragging
					pp = draggingObject.newPoint
				}

				if (o.type === 'line') {
					// draw a line
					const attributes = !o.selected ? o.attributes : o.selectedAttributes || {...o.attributes, color: 'yellow', width: (o.attributes.width || defaultLineWidth) * 1.5}
					ctxt.lineWidth = attributes.width || defaultLineWidth
					if (attributes.dash) ctxt.setLineDash(attributes.dash)
					ctxt.strokeStyle = attributes.color || 'black'
					ctxt.beginPath()
					ctxt.moveTo(pp.x, pp.y)
					ctxt.lineTo(pp.x + o.dx, pp.y + o.dy)
					ctxt.stroke()
					ctxt.setLineDash([])
				}
				else if (o.type === 'marker') {
					// draw a marker
					const attributes = !o.selected ? o.attributes : o.selectedAttributes || {...o.attributes, fillColor: 'orange', radius: (o.attributes.radius || defaultMarkerRadius) * 1.5}
					const radius = attributes.radius || defaultMarkerRadius
					const shape = o.attributes.shape || 'circle'
					ctxt.lineWidth = defaultLineWidth
					ctxt.fillStyle = attributes.fillColor || 'black'
					ctxt.strokeStyle = attributes.lineColor || 'black'

					ctxt.beginPath()
					if (shape === 'circle') {
						ctxt.ellipse(pp.x, pp.y, radius, radius, 0, 0, 2 * Math.PI)
					}
					else if (shape === 'square') {
						ctxt.rect(pp.x - radius, pp.y - radius, radius * 2, radius * 2)
					}
					attributes.fillColor && ctxt.fill()
					attributes.lineColor && ctxt.stroke()
				}
			}
			else if (o.type === 'connector') {
				// draw a connector
				const obj1 = objectsById[o.objectId1]
				const obj2 = objectsById[o.objectId2]
				if ((obj1) && (obj2) && (obj1.type === 'marker') && (obj2.type === 'marker')) {
					let pp1 = {x: obj1.x, y: obj1.y}
					if ((draggingObject) && (obj1.objectId === draggingObject.object?.objectId) && (draggingObject.newPoint)) {
						// use the new location if dragging
						pp1 = draggingObject.newPoint
					}

					let pp2 = {x: obj2.x, y: obj2.y}
					if ((draggingObject) && (obj2.objectId === draggingObject.object?.objectId) && (draggingObject.newPoint)) {
						// use the new location if dragging
						pp2 = draggingObject.newPoint
					}

					const attributes = o.attributes
					if (attributes.dash) ctxt.setLineDash(attributes.dash)
					ctxt.lineWidth = attributes.width || defaultLineWidth
					ctxt.strokeStyle = attributes.color || 'black'
					ctxt.beginPath()
					ctxt.moveTo(pp1.x, pp1.y)
					ctxt.lineTo(pp2.x, pp2.y)
					ctxt.stroke()
					ctxt.setLineDash([])
				}
			}
		}
		// paint all the objects in order
        objects.forEach(object => {
			paintObject(object)
		})
    }, [objects, width, height, draggingObject, dragState.isActive, dragState.dragRect])

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const p = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
		// communicate the mouse down action to the drag state
        dragStateDispatch({type: 'DRAG_MOUSE_DOWN', point: [p.x, p.y]})
    }, [])
	const handleMouseUp = useCallback((e: React.MouseEvent) => {
		const boundingRect = e.currentTarget.getBoundingClientRect()
		const p = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
		if (!dragState.isActive) {
			// if we are not dragging, and have released the mouse button
			// then let's call the object cclick handler if we find a clickable object
			// at this position
			let found = false
			for (let i = objects.length - 1; i >= 0; i--) {
				const o = objects[i]
				if (o.clickable) {
					if (pointInObject(o, p)) {
						found = true
						onClickObject && onClickObject(o.objectId, e)
						break
					}
				}
			}
			if (!found) {
				// if we didn't find a clickable object
				// then we call the click handler
				if (!draggingObject.object) {
					onClick && onClick(p, e)
				}
			}
		}
		if ((draggingObject.newPoint) && (draggingObject.object)) {
			// we have released the mouse button, and we were dragging an object
			// so let's call the drag object handler
			onDragObject && onDragObject(draggingObject.object.objectId, draggingObject.newPoint, e)
		}
		// set the active mouse event for purpose of passing this to event handlers
		setActiveMouseEvent(e)
		// communicate the mouse up action to the drag state
		dragStateDispatch({type: 'DRAG_MOUSE_UP', point: [p.x, p.y]})
    }, [dragState.isActive, objects, onClickObject, onClick, draggingObject.newPoint, draggingObject.object, onDragObject])
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const p = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
		// communicate the mouse move action to the drag state
		dragStateDispatch({type: 'DRAG_MOUSE_MOVE', point: [p.x, p.y]})
    }, [])
    const handleMouseLeave = useCallback((e: React.MouseEvent) => {
		// communicate the mouse leave action to the drag state
		dragStateDispatch({type: 'DRAG_MOUSE_LEAVE'})
    }, [])

	return (
		<div
            style={{width, height, position: 'relative'}}
            onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
			<BaseCanvas
				width={width}
				height={height}
				draw={paint}
				drawData={emptyDrawData}
			/>
		</div>
	)
}

const defaultDragStyle = 'rgba(196, 196, 196, 0.5)'

// check whether a point is contained in a scene2d object
const pointInObject = (o: Scene2dObject, p: {x: number, y: number}) => {
	if (o.type === 'marker') {
		const r = o.attributes.radius || defaultMarkerRadius
		const R: RectangularRegion = {xmin: o.x - r, ymin: o.y - r, xmax: o.x + r, ymax: o.y + r}
		return pointInRect([p.x, p.y], R)
	}
	else return false
}

export const createObjectId = () => (randomAlphaString(10))

export default Scene2d