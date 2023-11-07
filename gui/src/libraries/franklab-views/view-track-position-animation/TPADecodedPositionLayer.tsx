import { BaseCanvas, DrawFn } from '../../core-views'
import { FunctionComponent, useCallback, useMemo } from 'react'
import { DecodedPositionFramePx } from './TrackPositionAnimationTypes'

// EXAMPLE:
// https://figurl.org/f?v=http://localhost:3000&d=sha1://516fcb16508607f56e666a973451b06ab6fac35f&label=chimi-animation-v6b
// 



export type DecodeLayerProps = {
    width: number
    height: number
    drawData: DecodeFrameProps
    configuredDrawFnCallback: DrawFn<DecodeFrameProps>
}

type DecodeFrameProps = {
    frame: DecodedPositionFramePx | undefined
    peakCenterPx?: number[] // [x, y] pixel location of the center of the bin with highest probability (lowest linear number breaks ties)
}

type PeakPositionStyling = {
    dotRadius?: number,
    dotRgb?: string,
    drawPeakDot?: boolean
}

const defaultPeakPositionStyling: PeakPositionStyling = {
    dotRadius: 10,
    dotRgb: 'rgb(79, 227, 0)',
    drawPeakDot: true
}

const drawPeakDot = (context: CanvasRenderingContext2D, peakCenterPx: number[], peakStyling: PeakPositionStyling) => {
    if (peakStyling.dotRgb === undefined || peakStyling.dotRadius === undefined || peakStyling.dotRadius < 1 || !peakStyling.drawPeakDot) {
        console.warn(`Attempt to draw peak-probability dot with invalid settings -- no-op`)
        return
    }
    const [x, y] = [...peakCenterPx]

    context.fillStyle = peakStyling.dotRgb ?? defaultPeakPositionStyling.dotRgb
    context.beginPath()
    context.arc(x, y, peakStyling.dotRadius, 0, 2 * Math.PI)
    context.fill()
}

const draw = (context: CanvasRenderingContext2D, props: DecodeFrameProps, colorStyles: string[], peakStyling: PeakPositionStyling) => {
    const { frame, peakCenterPx } = props
    if (!frame) return
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)

    const { locationRectsPx: bins, values } = frame
    if (values.length === 0) return

    // TODO: Test efficiency. It may be preferable to order by intensity to avoid changing styles (though current performance is fine).
    // TODO: Test whether we can expand the regions being drawn to create a smoother effect.
    // TODO: Maybe a useful form of preprocessing would convert the scalar value to the styles and then sort by those keys?
    values.forEach((v, i) => {
        const style = colorStyles[v]
        context.beginPath()
        context.fillStyle = style
        context.strokeStyle = style
        const r = bins[i]
        context.rect(r[0], r[1], r[2], r[3])
        context.stroke()
        context.fill()
    })

    // TODO: Suppress drawing if peak dot is in the same bin as the animal's actual position?
    if (peakStyling && !peakStyling.drawPeakDot) return
    peakCenterPx && drawPeakDot(context, peakCenterPx, peakStyling)
}

export const useConfiguredDecodedPositionDrawFunction = (colorStyles: string[], peakStyling?: PeakPositionStyling) => {
    const _peakStyling = useMemo(() => { return { ...defaultPeakPositionStyling, ...peakStyling }}, [peakStyling])
    return useCallback((context: CanvasRenderingContext2D, props: DecodeFrameProps) => draw(context, props, colorStyles, _peakStyling), [colorStyles, _peakStyling])
}

const TPADecodedPositionLayer: FunctionComponent<DecodeLayerProps> = (props: DecodeLayerProps) => {
    const { width, height, drawData, configuredDrawFnCallback } = props

    return (
        <BaseCanvas<DecodeFrameProps>
            width={width}
            height={height}
            draw={configuredDrawFnCallback}
            drawData={drawData}
        />
    )
}

export default TPADecodedPositionLayer
