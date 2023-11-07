import { BaseCanvas, DrawFn } from "../../core-views"
import { cos, sin } from "mathjs"
import { FunctionComponent, useCallback } from "react"
import { PositionFrame } from "./TrackPositionAnimationTypes"

export type TPAPositionLayerProps = {
    width: number
    height: number
    drawData: PositionProps
    configuredDrawFnCallback: DrawFn<PositionProps>
}

type PositionProps = {
    frame: PositionFrame
    bottomMargin: number
}

type ObservedPositionStyling = {
    dotColor?: string
    dotRadius?: number
}

const defaultPositionStyling = {
    dotColor: 'rgb(210, 128, 0)',
    dotRadius: 10
}

const headRadiusRatio = 1.8
const rightAngle = Math.PI/2
// const defaultTrianglePartialRadius = defaultPositionRadius * 1

const draw = (context: CanvasRenderingContext2D, props: PositionProps, dotColor: string, dotRadius: number) => {
    const { bottomMargin, frame } = props
    if (!frame) return

    const headRadius = dotRadius * headRadiusRatio
    const trianglePartialRadius = dotRadius

    context.font = `${Math.min(Math.floor(bottomMargin * .5), 30)}px sans-serif`
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    context.beginPath()
    context.fillStyle = dotColor
    context.arc(frame.x, frame.y, dotRadius, 0, 2*Math.PI)
    context.fill()
    if (frame.headDirection) {
        const localHeadDirection = frame.headDirection
        // remember, in pixelspace the y axis is flipped so its positive direction is down, not up.
        // so we should be subtracting, not adding, the sin values.
        const headX = frame.x + headRadius * cos(localHeadDirection)
        const headY = frame.y - headRadius * sin(localHeadDirection)
        const triAX = frame.x + trianglePartialRadius * cos(localHeadDirection + rightAngle)
        const triAY = frame.y - trianglePartialRadius * sin(localHeadDirection + rightAngle)
        const triBX = frame.x + trianglePartialRadius * cos(localHeadDirection - rightAngle)
        const triBY = frame.y - trianglePartialRadius * sin(localHeadDirection - rightAngle)

        context.beginPath()
        context.moveTo(headX, headY)
        context.lineTo(triAX, triAY)
        context.lineTo(triBX, triBY)
        context.closePath()
        // context.lineTo(headRadius * cos(frame.headDirection), headRadius * sin(frame.headDirection))
        context.fill()
    }

    if (frame.timestamp) {
        context.fillStyle = 'black'
        context.textAlign = 'center'
        context.textBaseline = 'top'
        context.fillText(`${frame.timestamp.toFixed(3)} seconds`, context.canvas.width/2, context.canvas.height - bottomMargin/2)
    }
}

export const useConfiguredObservedPositionDrawFunction = (styling?: ObservedPositionStyling) => {
    const { dotColor, dotRadius } = { ...defaultPositionStyling, ...styling }
    return useCallback((context: CanvasRenderingContext2D, props: PositionProps) => draw(context, props, dotColor, dotRadius), [dotColor, dotRadius])
}

const TPAPositionLayer: FunctionComponent<TPAPositionLayerProps> = (props: TPAPositionLayerProps) => {
    const { width, height, drawData, configuredDrawFnCallback } = props

    return (
        <BaseCanvas<PositionProps>
            width={width}
            height={height}
            draw={configuredDrawFnCallback}
            drawData={drawData}
        />
    )
}

export default TPAPositionLayer
