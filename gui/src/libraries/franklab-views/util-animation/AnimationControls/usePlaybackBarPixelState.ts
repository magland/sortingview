import { useMemo } from 'react'
import { LogicalBarInterpreter, LogicalBarInterpreterGenerator } from './usePlaybackBarGeometry'

type PlaybackBarPixelStateProps = {
    currentFrameIndex: number
    visibleWindow: [number, number]
    windowProposal?: [number, number]
    getBarInterpreter: LogicalBarInterpreterGenerator
    getBarClickToFrame: (interpreter: LogicalBarInterpreter) => (x: number, y: number) => number | undefined
    frameToPixelX: (elapsedFrames: number) => number
}


const useWindowProposal = (frameToPixelX: (elapsedFrames: number) => number, visibleStart: number, windowProposal?: [number, number]) => {
    return useMemo(() => {
        return windowProposal ? windowProposal.map(i => frameToPixelX(i - visibleStart)) : undefined
    }, [frameToPixelX, windowProposal, visibleStart])
}


const usePlaybackBarPixelState = (props: PlaybackBarPixelStateProps) => {
    const { currentFrameIndex, visibleWindow, windowProposal, getBarInterpreter, getBarClickToFrame, frameToPixelX } = props

    const proposalXRange = useWindowProposal(frameToPixelX, visibleWindow[0], windowProposal)
    const currentElapsedFrames = useMemo(() => currentFrameIndex - visibleWindow[0], [currentFrameIndex, visibleWindow])
    const scrubberCenterX = useMemo(() => frameToPixelX(currentElapsedFrames), [frameToPixelX, currentElapsedFrames])
    const barInterpreter = getBarInterpreter(scrubberCenterX)
    const barClickToFrame = getBarClickToFrame(barInterpreter)

    return { scrubberCenterX, barInterpreter, barClickToFrame, proposalXRange }
}

export default usePlaybackBarPixelState
