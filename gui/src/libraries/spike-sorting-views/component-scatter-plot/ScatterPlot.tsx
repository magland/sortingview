import { useDragSelectLayer } from '../../core-utils';
import { BaseCanvas, rectangularRegionsIntersect, Vec2, Vec4 } from '../../core-views';
import { FunctionComponent, useCallback, useMemo } from 'react';
import ScatterPlotMainLayer from './ScatterPlotMainLayer';

export type ScatterPlotMarker = {
    key: string | number
    x: number
    y: number
    tooltip: string
    color: string
    radius: number
}

type Props = {
    width: number
    height: number
    xRange?: {min: number, max: number}
    yRange?: {min: number, max: number}
    markers: ScatterPlotMarker[]
    onSelectRect?: (r: {x: number, y: number, width: number, height: number}, selectedMarkerKeys: (string | number)[], o: {ctrlKey: boolean, shiftKey: boolean}) => void
    onClickPoint?: (p: {x: number, y: number}, markerKey: string | number | undefined, o: {ctrlKey: boolean, shiftKey: boolean}) => void
}

export type Margins = {
    left: number, right: number, top: number, bottom: number
}

const emptyDrawData = {}

const ScatterPlot: FunctionComponent<Props> = ({markers, xRange, yRange, onSelectRect, onClickPoint, width, height}) => {
    const {margins}: {margins: Margins} = useMemo(() => {
        const margins = {
            left: 20,
            right: 20,
            top: 20,
            bottom: 20 // 3 + (xLabel ? 13 : 0) + (ticks ? 13 : 0)
        }
        return {margins}
    }, [])
    const {xMin, xMax, yMin, yMax} = useMemo(() => {
        let xMin: number, xMax: number, yMin: number, yMax: number
        if (xRange) {
            xMin = xRange.min
            xMax = xRange.max
        }
        else {
            if (markers.length > 0) {
                xMin = Math.min(...markers.map(m => (m.x)))
                xMax = Math.max(...markers.map(m => (m.x)))
            }
            else {
                xMin = 0
                xMax = 1
            }
        }
        if (yRange) {
            yMin = yRange.min
            yMax = yRange.max
        }
        else {
            if (markers.length > 0) {
                yMin = Math.min(...markers.map(m => (m.y)))
                yMax = Math.max(...markers.map(m => (m.y)))
            }
            else {
                yMin = 0
                yMax = 1
            }
        }
        return {xMin, xMax, yMin, yMax}
    }, [markers, xRange, yRange])
    const {coord2Pixel, pixel2Coord} = useMemo(() => {
        const W = width - margins.left - margins.right
        const H = height - margins.top - margins.bottom
        const coord2Pixel = (p: {x: number, y: number}): {x: number, y: number} => {
            return {
                x: margins.left + (p.x - xMin) / (xMax - xMin) * W,
                y: margins.top + (1 - (p.y - yMin) / (yMax - yMin)) * H
            }
        }
        const pixel2Coord = (p: {x: number, y: number}): {x: number, y: number} => {
            return {
                x: xMin + (p.x - margins.left) / W * (xMax - xMin),
                y: yMin + (1 - (p.y - margins.top) / H) * (yMax - yMin)
            }
        }
        return {coord2Pixel, pixel2Coord}
    }, [width, height, margins, xMin, xMax, yMin, yMax])
    const handleSelectRect = useCallback((r: Vec4, {ctrlKey, shiftKey}: {ctrlKey: boolean, shiftKey: boolean}) => {
        const rA = {x: r[0], y: r[1], width: r[2], height: r[3]}
        const selectedMarkerKeys: (string | number)[] = []
        for (let m of markers) {
            const p = coord2Pixel({x: m.x, y: m.y})
            const pR = {xmin: p.x - m.radius, ymin: p.y - m.radius, xmax: p.x + m.radius, ymax: p.y + m.radius}
            if (rectangularRegionsIntersect({xmin: rA.x, xmax: rA.x + rA.width, ymin: rA.y, ymax: rA.y + rA.height}, pR)) {
                selectedMarkerKeys.push(m.key)
            }
        }
        const r0 = transformRect(pixel2Coord, rA)
        onSelectRect && onSelectRect(r0, selectedMarkerKeys, {ctrlKey, shiftKey})
    }, [onSelectRect, pixel2Coord, markers, coord2Pixel])
    const handleClickPoint = useCallback((x: Vec2, {ctrlKey, shiftKey}: {ctrlKey: boolean, shiftKey: boolean}) => {
        const p = {x: x[0], y: x[1]}
        const rA = {x: p.x, y: p.y, width: 1, height: 1}
        let selectedMarkerKey: string | number | undefined = undefined
        for (let m of markers) {
            const p = coord2Pixel({x: m.x, y: m.y})
            const pR = {xmin: p.x - m.radius, ymin: p.y - m.radius, xmax: p.x + m.radius, ymax: p.y + m.radius}
            if (rectangularRegionsIntersect({xmin: rA.x, xmax: rA.x + rA.width, ymin: rA.y, ymax: rA.y + rA.height}, pR)) {
                selectedMarkerKey = m.key
            }
        }
        onClickPoint && onClickPoint(pixel2Coord(p), selectedMarkerKey, {ctrlKey, shiftKey})
    }, [coord2Pixel, markers, onClickPoint, pixel2Coord])
    const {onMouseMove, onMouseDown, onMouseUp, onMouseLeave, paintDragSelectLayer} = useDragSelectLayer(width, height, handleSelectRect, handleClickPoint)

    const dragSelectCanvas = useMemo(() => {
        return <BaseCanvas
            width={width}
            height={height}
            draw={paintDragSelectLayer}
            drawData={emptyDrawData}
        />
    }, [width, height, paintDragSelectLayer])

    return (
        <div
            style={{width, height, position: 'relative'}}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
        >
            <ScatterPlotMainLayer
                markers={markers}
                margins={margins}
                coord2Pixel={coord2Pixel}
                width={width}
                height={height}
            />
            {dragSelectCanvas}
        </div>
    )
}

const transformRect = (t: (p: {x: number, y: number}) => {x: number, y: number}, r: {x: number, y: number, width: number, height: number}) => {
    const p0 = t({x: r.x, y: r.y})
    const p1 = t({x: r.x + r.width, y: r.y + r.height})
    return {
        x: Math.min(p0.x, p1.x),
        y: Math.min(p0.y, p1.y),
        width: Math.abs(p1.x - p0.x),
        height: Math.abs(p1.y - p0.y)
    }
}

export default ScatterPlot