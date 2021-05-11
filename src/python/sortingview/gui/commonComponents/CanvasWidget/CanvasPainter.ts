import { matrix, multiply } from 'mathjs'
import { getCenter, getHeight, getWidth, isNumber, isString, isVec2, isVec3, isVec4, RectangularRegion, toTransformationMatrix, TransformationMatrix, transformPoint, transformRect, Vec2, Vec3, Vec4 } from './Geometry'

export interface TextAlignment {
    Horizontal: 'AlignLeft' | 'AlignCenter' | 'AlignRight'
    Vertical: 'AlignTop' | 'AlignCenter' | 'AlignBottom'
}
export const isTextAlignment = (x: any): x is TextAlignment => {
    switch (x.Horizontal) {
        case 'AlignLeft':
        case 'AlignCenter':
        case 'AlignRight':
            break
        default:
            return false
    }
    switch (x.Vertical) {
        case 'AlignTop':
        case 'AlignCenter':
        case 'AlignBottom':
            break
        default:
            return false
    }
    return true
}
export type TextOrientation = 'Horizontal' | 'Vertical'

interface TextAlignmentConfig {
    x: number
    y: number
    textAlign: 'left' | 'center' | 'right'
    textBaseline: 'bottom' | 'middle' | 'top'
}

const rotateRect = (r: RectangularRegion) => {
    // Corresponds to a 90-degree (counterclockwise) rotation around the origin.
    // A rectangle in quadrant I will wind up in quadrant II lying on its left side, etc.
    return {xmin: -r.ymax, xmax: -r.ymin, ymin: r.xmin, ymax: r.xmax}
}

const rotateTextAlignment = (a: TextAlignment): TextAlignment => {
    return {
        Horizontal: a.Vertical === 'AlignBottom' ? 'AlignLeft' : (a.Vertical === 'AlignTop' ? 'AlignRight': 'AlignCenter'),
        Vertical: a.Horizontal === 'AlignRight' ? 'AlignBottom' : (a.Horizontal === 'AlignLeft' ? 'AlignTop': 'AlignCenter'),
    }
}

const getTextAlignmentConfig = (rect: RectangularRegion, alignment: TextAlignment): TextAlignmentConfig => {
    let x, y
    let textAlign: 'left' | 'center' | 'right' = 'left'
    let textBaseline: 'bottom' | 'middle' | 'top' = 'bottom'
    switch (alignment.Horizontal) {
        case 'AlignLeft':
            x = rect.xmin
            textAlign = 'left'
            break
        case 'AlignCenter':
            x = getCenter(rect)[0]
            textAlign = 'center'
            break
        case 'AlignRight':
            x = rect.xmax
            textAlign = 'right'
            break
        default: // can't happen
            throw new Error('Missing horizontal alignment in drawText: AlignLeft, AlignCenter, or AlignRight');
        }
    switch (alignment.Vertical) {
        case 'AlignBottom':
            y = rect.ymax
            textBaseline = 'bottom'
            break
        case 'AlignCenter':
            y = getCenter(rect)[1]
            textBaseline = 'middle'
            break
        case 'AlignTop':
            y = rect.ymin
            textBaseline = 'top'
            break
        default: // can't happen
            throw new Error('Missing vertical alignment in drawText: AlignTop, AlignBottom, or AlignVCenter');
    }
    return {x: x, y: y, textAlign: textAlign, textBaseline: textBaseline}
}


// html5 canvas context
export type Context2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

type Color = 'black' | 'red' | 'blue' | 'transparent' | string
// TODO: Define additional colors w/ lookup table?

export interface Pen {
    color: Color,
    width?: number // N.B. as of right now this is ALWAYS IN PIXELS, regardless of coordinate system.
    // This is somewhat inconsistent, but a) it's probably what you actually want, and b) it'd be annoying to change.
}

export interface Font {
    pixelSize: number,
    family: 'Arial' | string
}

export interface Brush {
    color: Color
}
export const isBrush = (x: any): x is Brush => {
    if (!x) return false
    if (typeof(x) !== 'object') return false
    if (!('color' in x)) return false
    return true
}


export class CanvasPainter {
    _exportingFigure: boolean = false
    _context2D: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
    _pixelWidth: number
    _pixelHeight: number
    _primaryContext2D: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
    _offscreenCanvas: OffscreenCanvas | null = null
    _transformMatrix: TransformationMatrix
    constructor(context2d: Context2D, pixelWidth: number, pixelHeight: number, transformMatrix: TransformationMatrix ) {
        this._context2D = context2d
        this._primaryContext2D = context2d
        this._pixelWidth = pixelWidth
        this._pixelHeight = pixelHeight
        this._transformMatrix = transformMatrix
    }
    // Return a new, transformed painter
    transform(m: TransformationMatrix): CanvasPainter {
        // todo: figure out whether this should be left or right-multiplication
        try {
            const m2 = toTransformationMatrix(multiply(matrix(this._transformMatrix), matrix(m)))
            return new CanvasPainter(this._context2D, this._pixelWidth, this._pixelHeight, m2)
        }
        catch(err) {
            console.warn('Problem transforming painter:', err)
            return this
        }
    }
    useOffscreenCanvas(W: number, H: number) {
        try {
            const c = new OffscreenCanvas(Math.max(W, 10), Math.max(H, 10))
            this._offscreenCanvas = c
            const cc = c.getContext('2d')
            if (!cc) throw Error('Unexpected')
            this._context2D = cc
        }
        catch(err) {
            console.warn('Problem in useOffscreenCanvas', err)
        }
    }
    transferOffscreenToPrimary() {
        const c = this._offscreenCanvas
        if (!c) {
            console.warn('No offscreen canvas')
            return
        }
        const image = c.transferToImageBitmap()
        this._context2D = this._primaryContext2D
        this._context2D.clearRect(0, 0, image.width, image.height)
        this._context2D.drawImage(image, 0, 0)
    }
    // TODO: Delete these default methods?
    getDefaultPen() {
        return { color: 'black' }
    }
    getDefaultFont() {
        return { "pixel-size": 12, family: 'Arial' }
    }
    getDefaultBrush() {
        return { color: 'black' }
    }
    createPainterPath() {
        return new PainterPath()
    }
    setExportingFigure(val: boolean) {
        this._exportingFigure = val
    }
    exportingFigure() {
        return this._exportingFigure
    }
    // This is a log function, basically just for debugging purposes.
    fillWholeCanvas(color: Color): void {
        console.log(`Pixel dimensions: 0 to ${this._pixelWidth} and 0 to ${this._pixelHeight}`)
        this._context2D.save()
        applyBrush(this._context2D, {color: color})
        this._context2D.fillRect(0, 0, this._pixelWidth, this._pixelHeight)
        this._context2D.restore()
    }
    clear(): void {
        this.clearRect({xmin: 0, xmax: this._pixelWidth, ymin: 0, ymax: this._pixelHeight});
    }
    clearRect(rect: RectangularRegion) {
        this.fillRect(rect, {color: 'transparent'})
    }
    ctxSave() {
        this._context2D.save();
    }
    ctxRestore() {
        this._context2D.restore();
    }
    wipe(): void {
        // const pr = transformRect(this._transformMatrix, this._fullDimensions)
        // this._context2D.clearRect(pr.xmin, pr.ymin, getWidth(pr), getHeight(pr));
        this._context2D.clearRect(0, 0, this._pixelWidth, this._pixelHeight)
    }
    // TODO: REWRITE THIS ctxTranslate
    ctxTranslate(dx: number | Vec2, dy: number | undefined = undefined) {
        throw Error('Deprecated method, needs rewrite.')
        // if (dy === undefined) {
        //     if (typeof dx === 'number') {
        //         throw Error('unexpected');
        //     }
        //     let tmp = dx;
        //     dx = tmp[0];
        //     dy = tmp[1];
        //     this._context2D.translate(dx, dy);
        // }
        // if (typeof dx === 'object') {
        //     throw Error('Bad signature: dx object and dy not undef: ctxTranslate')
        // }
        // this._context2D.translate(dx, dy);
    }
    ctxRotate(theta: number) {
        this._context2D.rotate(theta)
    }
    fillRect(rect: RectangularRegion, brush: Brush) {
        const pr = transformRect(this._transformMatrix, rect) // covert rect to pixelspace
        // console.log(`Transformed ${JSON.stringify(rect)} to ${JSON.stringify(pr)}`)
        // console.log(`Measure (pixelspace) width: ${getWidth(pr)}, height: ${getHeight(pr)}`)
        this._context2D.save()
        applyBrush(this._context2D, brush)
        // NOTE: Due to the pixelspace-conversion axis flip, the height should be negative.
        this._context2D.fillRect(Math.min(pr.xmin, pr.xmax), Math.min(pr.ymin, pr.ymax), getWidth(pr), getHeight(pr))
        this._context2D.restore()
    }
    drawRect(rect: RectangularRegion, pen: Pen) {
        const pr = transformRect(this._transformMatrix, rect) // convert rect to pixelspace
        this._context2D.save()
        applyPen(this._context2D, pen)
        // NOTE: Due to the pixelspace-conversion axis flip, the height should be negative.
        this._context2D.strokeRect(Math.min(pr.xmin, pr.xmax), Math.min(pr.ymin, pr.ymax), getWidth(pr), getHeight(pr))
        this._context2D.restore()
    }
    getEllipseFromBoundingRect(boundingRect: RectangularRegion) {
        const r = transformRect(this._transformMatrix, boundingRect)
        const center = getCenter(r)
        const W = Math.abs(getWidth(r))
        const H = Math.abs(getHeight(r))
        return {center, W, H}
    }
    fillEllipse(boundingRect: RectangularRegion, brush: Brush) {
        const {center, W, H} = {...this.getEllipseFromBoundingRect(boundingRect)}
        // this._context2D.save()
        this._context2D.fillStyle = toColorStr(brush.color)
        this._context2D.beginPath()
        this._context2D.ellipse(center[0], center[1], W/2, H/2, 0, 0, 2 * Math.PI)
        this._context2D.fill()
        // this._context2D.restore()
    }
    drawEllipse(boundingRect: RectangularRegion, pen: Pen) {
        const {center, W, H} = {...this.getEllipseFromBoundingRect(boundingRect)}
        this._context2D.save()
        applyPen(this._context2D, pen)
        // console.log(`Attempting to draw ellipse: ${center[0]} ${center[1]} ${W/2} ${H/2}`)
        this._context2D.beginPath()
        this._context2D.ellipse(center[0], center[1], W/2, H/2, 0, 0, 2 * Math.PI)
        this._context2D.stroke()
        this._context2D.restore()
    }
    drawPath(painterPath: PainterPath, pen: Pen) {
        this._context2D.save()
        applyPen(this._context2D, pen)
        painterPath._draw(this._context2D, this._transformMatrix)
        this._context2D.restore()
    }
    drawLine(x1: number, y1: number, x2: number, y2: number, pen: Pen) {
        const pPath = new PainterPath();
        pPath.moveTo(x1, y1);
        pPath.lineTo(x2, y2);
        this.drawPath(pPath, pen);
    }
    drawText({text, rect, alignment, font, pen, brush, orientation='Horizontal'}: {text: string, rect: RectangularRegion, alignment: TextAlignment, font: Font, pen: Pen, brush: Brush, orientation?: TextOrientation}) {
        let rect2 = transformRect(this._transformMatrix, rect)
        this._context2D.save()
        if (orientation === 'Vertical') {
            this._context2D.rotate(-Math.PI / 2)
            rect2 = rotateRect(rect2)
            alignment = rotateTextAlignment(alignment)
        }

        // the following is useful for debugging the text placement, especially when orientation is Vertical
        // applyPen(this._context2D, {color: 'green'})
        // this._context2D.strokeRect(Math.min(rect2.xmin, rect2.xmax), Math.min(rect2.ymin, rect2.ymax), getWidth(rect2), getHeight(rect2))
        // this._context2D.strokeRect(Math.min(rect2.xmin, rect2.xmax) + 5, Math.min(rect2.ymin, rect2.ymax) + 5, getWidth(rect2) - 10, getHeight(rect2) - 10)

        applyFont(this._context2D, font)
        const config = getTextAlignmentConfig(rect2, alignment)
        applyTextAlignment(this._context2D, config)
        applyPen(this._context2D, pen);
        applyBrush(this._context2D, brush)
        this._context2D.translate(config.x, config.y)
        this._context2D.fillText(text, 0, 0)
        this._context2D.restore()
    }
    drawMarker(center: Vec2, opts: {radius: number, pen?: Pen, brush?: Brush}) {
        const p = transformPoint(this._transformMatrix, center)
        this._context2D.save()
        if (opts.pen) {
            applyPen(this._context2D, opts.pen)
            this._context2D.beginPath()
            this._context2D.ellipse(p[0], p[1], opts.radius, opts.radius, 0, 0, 2 * Math.PI)
            this._context2D.stroke()
        }
        if (opts.brush) {
            applyBrush(this._context2D, opts.brush)
            this._context2D.beginPath()
            this._context2D.ellipse(p[0], p[1], opts.radius, opts.radius, 0, 0, 2 * Math.PI)
            this._context2D.fill()
        }
        
        this._context2D.restore()
    }
    // in future we may want to implement this:
    // this.createImageData = function(W, H) {
    //     return ctx.getImageData(W, H);
    // }
    // this.putImageData = function(imagedata, x, y) {
    //     ctx.putImageData(imagedata, x, y);
    // }
    // this.drawImage = function(image, dx, dy) {
    //     ctx.drawImage(image, dx, dy);
    // }

    // TODO: implement markers
    // this.drawMarker = function(x, y, radius, shape, opts) {
    //     opts = opts || {};
    //     let pt = transformXY(x, y);
    //     _drawMarker(pt[0], pt[1], radius, shape, opts);
    // }
    // function _drawMarker(x, y, radius, shape, opts) {
    //     shape = shape || 'circle';
    //     let rect = [x-radius, y-radius, 2*radius, 2*radius];
    //     if (shape === 'circle') {
    //         if (opts.fill) {
    //             _fillEllipse(rect);
    //         }
    //         else {
    //             _drawEllipse(rect);
    //         }
    //     }
    //     else {
    //         console.error(`Unrecognized marker shape ${shape}`);
    //     }
    // }
    // this.fillMarker = function(x, y, radius, shape) {
    //     let pt = transformXY(x, y);
    //     _drawMarker(pt[0], pt[1], radius, shape, {fill: true});
    // }

}

interface PainterPathAction {
    name: 'moveTo' | 'lineTo'
    x: number | undefined
    y: number | undefined
}

export class PainterPath {
    _actions: PainterPathAction[] = []
    moveTo(x: number | Vec2, y: number | undefined = undefined): void {
        if (isVec2(x)) {
            return this.moveTo(x[0], x[1])
        }
        if (!isNumber(y)) throw Error('unexpected')
        this._actions.push({
            name: 'moveTo',
            x,
            y
        })
    }
    lineTo(x: number | Vec2, y: number | undefined = undefined): void {
        if (isVec2(x)) {
            return this.lineTo(x[0], x[1])
        }
        if (!isNumber(y)) throw Error('unexpected')
        this._actions.push({
            name: 'lineTo',
            x,
            y
        })
    }
    _draw(ctx: Context2D, tmatrix: TransformationMatrix) {
        ctx.beginPath();
        const actions = this._transformPathPoints(tmatrix)
        actions.forEach(a => {
            this._applyAction(ctx, a)
        })
        ctx.stroke();
    }
    _applyAction(ctx: Context2D, a: PainterPathAction) {
        if (a.name === 'moveTo') {
            a.x !== undefined && a.y !== undefined && ctx.moveTo(a.x, a.y);
        }
        else if (a.name === 'lineTo') {
            a.x !== undefined && a.y !== undefined && ctx.lineTo(a.x, a.y);
        }
    }
    _transformPathPoints(tmatrix: TransformationMatrix): PainterPathAction[] {
        const A = matrix(tmatrix)
        // if the paths were long it might be more efficient to make the vectors a wide matrix
        // ...but honestly it's probably so small a thing for what we do that it matters not
        return this._actions.map((a) => {
            if ((a.x !== undefined) && (a.y !== undefined)) {
                const x = matrix([a.x, a.y, 1])
                const b = multiply(A, x).toArray() as number[]
                return {...a, x: b[0], y: b[1] }
            }
            else {
                return a
            }
        })
    }
}

const toColorStr = (col: string | Vec3 | Vec4): string => {
    // TODO: Could do more validity checking here
    if (isString(col)) return col
    else if (isVec4(col)) {
        return (`rgba(${Math.floor(col[0])}, ${Math.floor(col[1])}, ${Math.floor(col[2])}, ${col[3]})`)
    } else if (isVec3(col)) {
        return (`rgb(${Math.floor(col[0])}, ${Math.floor(col[1])}, ${Math.floor(col[2])})`)
    } else {
        throw Error('unexpected')
    }
}

const applyPen = (ctx: Context2D, pen: Pen) => {
    const color = pen.color || 'black'
    const lineWidth = (isNumber(pen.width)) ? pen.width : 1
    ctx.strokeStyle = toColorStr(color)
    ctx.lineWidth = lineWidth || 1
}

const applyBrush = (ctx: Context2D, brush: Brush) => {
    const color = 'color' in brush ? brush.color : 'black'
    ctx.fillStyle = toColorStr(color)
}

const applyFont = (ctx: Context2D, font: Font) => {
    const size = font.pixelSize || '12'
    const face = font.family || 'Arial'
    ctx.font = `${size}px ${face}`
}

const applyTextAlignment = (ctx: Context2D, alignment: TextAlignmentConfig) => {
    ctx.textAlign = alignment.textAlign
    ctx.textBaseline = alignment.textBaseline
}

