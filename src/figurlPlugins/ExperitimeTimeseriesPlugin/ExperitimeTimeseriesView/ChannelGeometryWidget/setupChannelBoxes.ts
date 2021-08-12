import { funcToTransform } from 'figurl/labbox-react/components/CanvasWidget';
import { getBoundingBoxForEllipse, getHeight, getWidth, RectangularRegion, TransformationMatrix, transformDistance, Vec2 } from 'figurl/labbox-react/components/CanvasWidget/Geometry';
import { norm } from 'mathjs';
import { getArrayMax, getArrayMin } from 'python/sortingview/gui/extensions/common/utility';

export type ChannelBox = {
    label: string
    id: string
    x: number
    y: number
    rect: RectangularRegion
    transform: TransformationMatrix
}

const computeRadiusCache = new Map<string, number>()
const computeRadius = (channelLocations: number[][]): number => {
    const key = JSON.stringify(channelLocations)
    const val = computeRadiusCache.get(key)
    if (val !== undefined) {
        return val
    }
    // how big should each channel dot be? Really depends on how close
    // the dots are to each other. Let's find the closest pair of dots and
    // set the radius to 40% of the distance between them.
    let leastNorm = Number.MAX_VALUE
    channelLocations.forEach((point) => {
        channelLocations.forEach((otherPoint) => {
            const dist = norm([point[0] - otherPoint[0], point[1] - otherPoint[1]])
            if (dist === 0) return
            leastNorm = Math.min(leastNorm, dist as number)
        })
    })
    // (might set a hard cap, but remember these numbers are in channel-space coordinates)
    const radius = 0.45 * leastNorm
    computeRadiusCache.set(key, radius)
    return radius
}

const getChannelsBoundingBox = (channelLocations: number[][], radius: number): RectangularRegion => {
    return {
        xmin: getArrayMin(channelLocations.map(e => (e[0]))) - radius,
        xmax: getArrayMax(channelLocations.map(e => (e[0]))) + radius,
        ymin: getArrayMin(channelLocations.map(e => (e[1]))) - radius,
        ymax: getArrayMax(channelLocations.map(e => (e[1]))) + radius
    }
}

export const getChannelsAspectRatio = (channelLocations: Vec2[]) => {
    const radius = computeRadius(channelLocations)
    const boundingBox = getChannelsBoundingBox(channelLocations, radius)
    const boxAspect = getWidth(boundingBox) / getHeight(boundingBox)
    return boxAspect
}

const setupVerticalChannels = ({width, height, channelNames}: {width: number, height: number, channelNames: string[]}) => {
    // This is the case where we are displaying channels vertically
    // i.e., not according to the elec geometry, but rather in a
    // vertical fashion (as in the original MountainView)
    // There is a user option to toggle this display
    const xMargin = 10
    const yMargin = 10
    const n = channelNames.length
    
    // This is the layer transform which maps [0,1]x[0,1] into the content area of the layer
    // It is composed with the below transform for each channel
    const transform = funcToTransform((p: Vec2): Vec2 => {
        const x = xMargin + p[0] * ( width - 2 * xMargin )
        const y = yMargin + p[1] * ( height - 2 * yMargin )
        return [x, y]
    })

    const channelBoxes: ChannelBox[] = channelNames.map((eid, ii) => {
        // The vertical position of the ii^th channel
        // scaled to be between 0 and 1
        const y = (0.5 + ii) / (n + 1)
        
        // The rectangle which goes from x=0-1
        const rect = {xmin: 0, xmax: 1, ymin: y - 0.5 / (n + 1), ymax: y + 0.5 / (n + 1)}

        // This is the transform associated with the ii^th channel
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
        channelBoxes,
        transform,
        radius: 1 / (n + 1), // this is the radius of one channel box, which determines the amplitude scaling for waveforms
        pixelRadius: (height - 2 * yMargin) / (n + 1) // this is the same, except scaled to pixels
    }
}

const fixDegenerateCase = (channelLocations: Vec2[]) => {
    const box = {
        xmin: getArrayMin(channelLocations.map(e => (e[0]))),
        xmax: getArrayMax(channelLocations.map(e => (e[0]))),
        ymin: getArrayMin(channelLocations.map(e => (e[1]))),
        ymax: getArrayMax(channelLocations.map(e => (e[1])))
    }
    if ((box.xmin === box.xmax) && (box.ymin === box.ymax)) {
        return channelLocations.map((x, ii) => [ii, 0])
    }
    else {
        return channelLocations
    }
}

const setupChannelBoxes = (args: {width: number, height: number, channelLocations: Vec2[], channelNames: string[], layoutMode: 'geom' | 'vertical', maxChannelBoxPixelRadius?: number}): {
    channelBoxes: ChannelBox[],
    transform: TransformationMatrix,
    radius: number,
    pixelRadius: number
} => {
    const { width, height, channelLocations, channelNames, layoutMode } = args
    if (layoutMode === 'vertical') {
        return setupVerticalChannels({width, height, channelNames})
    }
    const correctedChannelLocations = fixDegenerateCase(channelLocations)
    const W = width - 10 * 2
    const H = height - 10 * 2
    const canvasAspect = W / H

    const radius = computeRadius(correctedChannelLocations)
    let boundingBox = getChannelsBoundingBox(correctedChannelLocations, radius)
    let boxAspect = getWidth(boundingBox) / getHeight(boundingBox)

    let realizedChannelLocations = correctedChannelLocations
    if ((boxAspect > 1) !== (canvasAspect > 1)) {
        // if the two aspect ratios' relationship to 1 is different, then one is portrait
        // and the other landscape. We should then correct by rotating the channel set 90 degrees.
        // note: a 90-degree rotation around the origin makes x' = y and y' = -x
        realizedChannelLocations = correctedChannelLocations.map((loc) => {
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

    // don't allow the channel boxes to appear too big
    if (args.maxChannelBoxPixelRadius) {
        if (radius * scaleFactor > args.maxChannelBoxPixelRadius) {
            scaleFactor /= (radius * scaleFactor / args.maxChannelBoxPixelRadius)
        }
    }

    const xMargin = (width - getWidth(boundingBox) * scaleFactor) / 2
    const yMargin = (height - getHeight(boundingBox) * scaleFactor) / 2

    const transform = funcToTransform((p: Vec2): Vec2 => {
        const x = xMargin + (p[0] - boundingBox.xmin) * scaleFactor
        const y = yMargin + (p[1] - boundingBox.ymin) * scaleFactor
        return [x, y]
    })

    const channelBoxes: ChannelBox[] = realizedChannelLocations.map((loc, i) => { 
        const x = loc[0]
        const y = loc[1]
        const rect = getBoundingBoxForEllipse([x, y], radius, radius)
        const transform0 = funcToTransform((p: Vec2): Vec2 => {
            const a = rect.xmin + p[0] * (rect.xmax - rect.xmin)
            const b = rect.ymin + p[1] * (rect.ymax - rect.ymin)
            return [a, b]
        })
        return { label: channelNames[i] + '', id: channelNames[i], x: x, y: y, rect, transform: transform0}}
    )
    const pixelRadius = transformDistance(transform, [radius, 0])[0]
    return {channelBoxes, transform, radius, pixelRadius}
}

export default setupChannelBoxes