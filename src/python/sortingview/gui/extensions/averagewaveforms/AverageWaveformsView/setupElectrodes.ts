import { norm } from 'mathjs';
import { funcToTransform } from 'labbox-react/components/CanvasWidget';
import { getBoundingBoxForEllipse, getHeight, getWidth, RectangularRegion, TransformationMatrix, transformDistance, Vec2 } from 'labbox-react/components/CanvasWidget/Geometry';
import { getArrayMax, getArrayMin } from '../../common/utility';

export type ElectrodeBox = {
    label: string
    id: number
    x: number
    y: number
    rect: RectangularRegion
    transform: TransformationMatrix
}

const computeRadiusCache = new Map<string, number>()
const computeRadius = (electrodeLocations: number[][]): number => {
    const key = JSON.stringify(electrodeLocations)
    const val = computeRadiusCache.get(key)
    if (val !== undefined) {
        return val
    }
    // how big should each electrode dot be? Really depends on how close
    // the dots are to each other. Let's find the closest pair of dots and
    // set the radius to 40% of the distance between them.
    let leastNorm = Number.MAX_VALUE
    electrodeLocations.forEach((point) => {
        electrodeLocations.forEach((otherPoint) => {
            const dist = norm([point[0] - otherPoint[0], point[1] - otherPoint[1]])
            if (dist === 0) return
            leastNorm = Math.min(leastNorm, dist as number)
        })
    })
    // (might set a hard cap, but remember these numbers are in electrode-space coordinates)
    const radius = 0.45 * leastNorm
    computeRadiusCache.set(key, radius)
    return radius
}

const getElectrodesBoundingBox = (electrodeLocations: number[][], radius: number): RectangularRegion => {
    return {
        xmin: getArrayMin(electrodeLocations.map(e => (e[0]))) - radius,
        xmax: getArrayMax(electrodeLocations.map(e => (e[0]))) + radius,
        ymin: getArrayMin(electrodeLocations.map(e => (e[1]))) - radius,
        ymax: getArrayMax(electrodeLocations.map(e => (e[1]))) + radius
    }
}

export const getElectrodesAspectRatio = (electrodeLocations: Vec2[]) => {
    const radius = computeRadius(electrodeLocations)
    const boundingBox = getElectrodesBoundingBox(electrodeLocations, radius)
    const boxAspect = getWidth(boundingBox) / getHeight(boundingBox)
    return boxAspect
}

const setupVerticalElectrodes = ({width, height, electrodeIds}: {width: number, height: number, electrodeIds: number[]}) => {
    // This is the case where we are displaying electrodes vertically
    // i.e., not according to the elec geometry, but rather in a
    // vertical fashion (as in the original MountainView)
    // There is a user option to toggle this display
    const xMargin = 10
    const yMargin = 10
    const n = electrodeIds.length
    
    // This is the layer transform which maps [0,1]x[0,1] into the content area of the layer
    // It is composed with the below transform for each electrode
    const transform = funcToTransform((p: Vec2): Vec2 => {
        const x = xMargin + p[0] * ( width - 2 * xMargin )
        const y = yMargin + p[1] * ( height - 2 * yMargin )
        return [x, y]
    })

    const electrodeBoxes: ElectrodeBox[] = electrodeIds.map((eid, ii) => {
        // The vertical position of the ii^th electrode
        // scaled to be between 0 and 1
        const y = (0.5 + ii) / (n + 1)
        
        // The rectangle which goes from x=0-1
        const rect = {xmin: 0, xmax: 1, ymin: y - 0.5 / (n + 1), ymax: y + 0.5 / (n + 1)}

        // This is the transform associated with the ii^th electrode
        // This transponse gets composed with the above layer transform
        const transform0 = funcToTransform((p: Vec2): Vec2 => {
            const a = rect.xmin + p[0] * (rect.xmax - rect.xmin)
            const b = rect.ymin + p[1] * (rect.ymax - rect.ymin)
            return [a, b]
        })
        return {
            label: eid + '',
            id: eid,
            x: 0.5, // (x, y) here is the center point
            y,
            rect,
            transform: transform0
        }
    })
    
    return {
        electrodeBoxes,
        transform,
        radius: 1 / (n + 1), // this is the radius of one electrode, which determines the amplitude scaling for waveforms
        pixelRadius: (height - 2 * yMargin) / (n + 1) // this is the same, except scaled to pixels
    }
}

const fixDegenerateCase = (electrodeLocations: Vec2[]) => {
    const box = {
        xmin: getArrayMin(electrodeLocations.map(e => (e[0]))),
        xmax: getArrayMax(electrodeLocations.map(e => (e[0]))),
        ymin: getArrayMin(electrodeLocations.map(e => (e[1]))),
        ymax: getArrayMax(electrodeLocations.map(e => (e[1])))
    }
    if ((box.xmin === box.xmax) && (box.ymin === box.ymax)) {
        return electrodeLocations.map((x, ii) => [ii, 0])
    }
    else {
        return electrodeLocations
    }
}

const setupElectrodes = (args: {width: number, height: number, electrodeLocations: Vec2[], electrodeIds: number[], layoutMode: 'geom' | 'vertical', maxElectrodePixelRadius?: number}): {
    electrodeBoxes: ElectrodeBox[],
    transform: TransformationMatrix,
    radius: number,
    pixelRadius: number
} => {
    const { width, height, electrodeLocations, electrodeIds, layoutMode } = args
    if (layoutMode === 'vertical') {
        return setupVerticalElectrodes({width, height, electrodeIds})
    }
    const correctedElectrodeLocations = fixDegenerateCase(electrodeLocations)
    const W = width - 10 * 2
    const H = height - 10 * 2
    const canvasAspect = W / H

    const radius = computeRadius(correctedElectrodeLocations)
    let boundingBox = getElectrodesBoundingBox(correctedElectrodeLocations, radius)
    let boxAspect = getWidth(boundingBox) / getHeight(boundingBox)

    let realizedElectrodeLocations = correctedElectrodeLocations
    if ((boxAspect > 1) !== (canvasAspect > 1)) {
        // if the two aspect ratios' relationship to 1 is different, then one is portrait
        // and the other landscape. We should then correct by rotating the electrode set 90 degrees.
        // note: a 90-degree rotation around the origin makes x' = y and y' = -x
        realizedElectrodeLocations = correctedElectrodeLocations.map((loc) => {
            return [loc[1], -loc[0]]
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

    // don't allow the electrodes to appear too big
    if (args.maxElectrodePixelRadius) {
        if (radius * scaleFactor > args.maxElectrodePixelRadius) {
            scaleFactor /= (radius * scaleFactor / args.maxElectrodePixelRadius)
        }
    }

    const xMargin = (width - getWidth(boundingBox) * scaleFactor) / 2
    const yMargin = (height - getHeight(boundingBox) * scaleFactor) / 2

    const transform = funcToTransform((p: Vec2): Vec2 => {
        const x = xMargin + (p[0] - boundingBox.xmin) * scaleFactor
        const y = yMargin + (p[1] - boundingBox.ymin) * scaleFactor
        return [x, y]
    })

    const electrodeBoxes: ElectrodeBox[] = realizedElectrodeLocations.map((loc, i) => { 
        const x = loc[0]
        const y = loc[1]
        const rect = getBoundingBoxForEllipse([x, y], radius, radius)
        const transform0 = funcToTransform((p: Vec2): Vec2 => {
            const a = rect.xmin + p[0] * (rect.xmax - rect.xmin)
            const b = rect.ymin + p[1] * (rect.ymax - rect.ymin)
            return [a, b]
        })
        return { label: electrodeIds[i] + '', id: electrodeIds[i], x: x, y: y, rect, transform: transform0}}
    )
    const pixelRadius = transformDistance(transform, [radius, 0])[0]
    return {electrodeBoxes, transform, radius, pixelRadius}
}

export default setupElectrodes