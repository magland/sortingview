import { BaseCanvas } from '../../core-views'
import { FunctionComponent, useMemo } from 'react'

export type TrackLayerProps = {
    width: number
    height: number
    trackBucketRectanglesPx: number[][]
    trackColor?: string
}

const defaultTrackColor = 'rgb(0,70,168)'

const drawTrack = (context: CanvasRenderingContext2D, props: TrackLayerProps) => {
    const {trackBucketRectanglesPx, trackColor} = props

    // BaseCanvas takes care of not redrawing too much
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    context.beginPath()
    trackBucketRectanglesPx.forEach(rect => {
        context.rect(rect[0], rect[1], rect[2], rect[3])
    })
    context.fillStyle = trackColor ?? defaultTrackColor
    context.fill()
}

const TPATrackLayer: FunctionComponent<TrackLayerProps> = (props: TrackLayerProps) => {
    const { trackBucketRectanglesPx, trackColor, width, height } = props
    const drawData = useMemo(() => ({
        trackBucketRectanglesPx, trackColor, width, height
    }), [trackBucketRectanglesPx, trackColor, width, height])

    return (
        <BaseCanvas
            width={width}
            height={height}
            draw={drawTrack}
            drawData={drawData}
        />
    )
}

export default TPATrackLayer
