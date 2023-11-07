import { BaseCanvas } from "../../core-views";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { AffineTransform, applyAffineTransform, applyAffineTransformInv, createAffineTransform, identityAffineTransform, inverseAffineTransform, multAffineTransforms } from "./AffineTransform";

type Props = {
    unitIds1: (number | string)[]
    unitIds2: (number | string)[]
    selectedUnitIds: Set<string | number>
    onSetSelectedUnitIds: (x: (string | number)[]) => void
    matrix: number[][]
    range: [number, number]
    setHoveredInfo: (o: {unitId1: number | string, unitId2: number | string, value: number | undefined} | undefined) => void
    width: number
    height: number
}

export const useWheelZoom = (width: number, height: number, o: {shift?: boolean, alt?: boolean}={}) => {
    const shift = o.shift !== undefined ? o.shift : true
    const alt = o.shift !== undefined ? o.alt : false
    const [affineTransform, setAffineTransform] = useState<AffineTransform>(identityAffineTransform)
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if ((shift) && (!e.shiftKey)) return
        if ((!shift) && (e.shiftKey)) return
        if ((alt) && (!e.altKey)) return
        if ((!alt) && (e.altKey)) return
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const point = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
        const deltaY = e.deltaY
        const scaleFactor = 1.3
        let X = createAffineTransform([
            [scaleFactor, 0, (1 - scaleFactor) * point.x],
            [0, scaleFactor, (1 - scaleFactor) * point.y]
        ])
        if (deltaY > 0) X = inverseAffineTransform(X)
        let newTransform = multAffineTransforms(
            X,
            affineTransform
        )
        // test to see if we should snap back to identity
        const p00 = applyAffineTransform(newTransform, {x: 0, y: 0})
        const p11 = applyAffineTransform(newTransform, {x: width, y: height})
        if ((0 <= p00.x) && (p00.x < width) && (0 <= p00.y) && (p00.y < height)) {
            if ((0 <= p11.x) && (p11.x < width) && (0 <= p11.y) && (p11.y < height)) {
                newTransform = identityAffineTransform
            }
        }

        setAffineTransform(newTransform)
        return false
    }, [affineTransform, height, width, shift, alt])
    return {
        affineTransform,
        handleWheel
    }
}

const MatrixWidget: FunctionComponent<Props> = ({unitIds1, unitIds2, selectedUnitIds, onSetSelectedUnitIds, matrix, range, setHoveredInfo, width, height}) => {
    // const indsForIds = useMemo(() => {
    //     const indsForIds: { [k: number | string]: number } = {}
    //     unitIds.forEach((id, i) => {
    //         indsForIds[id] = i
    //     })
    //     return indsForIds
    // }, [unitIds])

    const size = Math.min(width, height)
    const offsetX = (width - size) / 2
    const offsetY = (height - size) / 2
    const {affineTransform, handleWheel} = useWheelZoom(width, height, {shift: true, alt: false})
    const indToPixel = useMemo(() => (o: {i1: number, i2: number}) => (
        applyAffineTransform(affineTransform, {
            x: offsetX + o.i1 / unitIds1.length * size,
            y: offsetY + o.i2 / unitIds2.length * size
        })
    ), [unitIds1.length, unitIds2.length, size, offsetX, offsetY, affineTransform])
    const pixelToInd = useMemo(() => (p: {x: number, y: number}) => {
        const p2 = applyAffineTransformInv(affineTransform, p)
        const i1 = Math.floor((p2.x - offsetX) / size * unitIds1.length)
        const i2 =Math.floor((p2.y - offsetY) / size * unitIds2.length)
        return (
            (0 <= i1) && (i1 < unitIds1.length) && (0 <= i2) && (i2 < unitIds2.length)
        ) ? {i1, i2} : undefined
    }, [unitIds1.length, unitIds2.length, size, offsetX, offsetY, affineTransform])
    const paint = useCallback((ctxt: CanvasRenderingContext2D) => {
        ctxt.clearRect(0, 0, width, height)
        ctxt.fillStyle = `rgb(100, 100, 80)`
        const pt1 = indToPixel({i1: 0, i2: 0})
        const pt2 = indToPixel({i1: unitIds1.length, i2: unitIds2.length})
        ctxt.fillRect(pt1.x, pt1.y, pt2.x - pt1.x, pt2.y - pt1.y)
        unitIds1.forEach((u1, i1) => {
            unitIds2.forEach((u2, i2) => {
                const {x: x1, y: y1} = indToPixel({i1, i2})
                const {x: x2, y: y2} = indToPixel({i1: i1 + 1, i2: i2 + 1})
                const col = colorForValue(matrix[i1][i2], range, false)
                ctxt.fillStyle = col
                const w = x2 - x1 >= 10 ? 3 : x2 - x1 >= 6 ? 2 : x2 - x1 >= 4 ? 1 : 0
                ctxt.fillRect(x1, y1, x2 - x1 - w, y2 - y1 - w)
                if ((selectedUnitIds.has(u1)) && (selectedUnitIds.has(u2))) {
                    const col2 = colorForValue(matrix[i1][i2], range, true)
                    ctxt.strokeStyle = col2
                    ctxt.lineWidth = w
                    ctxt.strokeRect(x1, y1, x2 - x1 - w, y2 - y1 - w)
                }
            })
        })
    }, [indToPixel, matrix, unitIds1, unitIds2, selectedUnitIds, width, height, range])
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const point = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
        const ind = pixelToInd(point)
        if (ind) {
            onSetSelectedUnitIds([unitIds1[ind.i1], unitIds2[ind.i2]])
        }
    }, [onSetSelectedUnitIds, unitIds1, unitIds2, pixelToInd])
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const point = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
        const ind = pixelToInd(point)
        if (ind) {
            setHoveredInfo({unitId1: unitIds1[ind.i1], unitId2: unitIds2[ind.i2], value: matrix[ind.i1][ind.i2]})
        }
        else {
            setHoveredInfo(undefined)
        }
    }, [pixelToInd, matrix, setHoveredInfo, unitIds1, unitIds2])
    const handleMouseLeave = useCallback((e: React.MouseEvent) => {
        setHoveredInfo(undefined)
    }, [setHoveredInfo])
    
    return (
        <div
            style={{width, height, position: 'relative'}}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <BaseCanvas
                width={width}
                height={height}
                draw={paint}
                drawData={null}
            />
        </div>
    )
}

const colorForValue = (v: number, range: [number, number], highlight?: boolean) => {
    if (isNaN(v)) {
        return !highlight ? `rgb(50, 20, 0)` : `rgb(0, 0, 255)`
    }
    const a = Math.min(255, Math.max(0, Math.floor((v - range[0]) / (range[1] - range[0]) * 255)))
    const b = Math.min(255, Math.max(0, 255 - a - 30))
    return !highlight ? `rgb(${a}, ${a}, ${a})` : `rgb(${b}, ${b}, 255)`
}

export default MatrixWidget