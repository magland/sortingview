import React from "react"

const MS_PER_TICK_60HZ = 1000/60

export type DrawFn<T> = (frame_data: T) => void

export type AnimationState<T> = {
    frameData: T[],
    window: [number, number],
    windowProposal?: [number, number]
    windowSynced: boolean,
    replayMultiplier: number,
    isPlaying: boolean,
    currentFrameIndex: number,
    playbackStartedTimestamp: number | undefined,
    playbackStartedFrameIndex: number,
    pendingFrameCode: number | undefined,
    baseMsPerFrame: number, // the number of ms per frame that will correspond to 1:1 playback, i.e. playback in real-time of the recording.
    animationDispatchFn: ((calltime: number) => void) | undefined
}

export type AnimationStateDispatcher<T> = React.Dispatch<AnimationStateAction<T>>

export type AnimationStateActionType = 'SET_DISPATCH' | 'UPDATE_FRAME_DATA' | 'SET_BASE_MS_PER_FRAME' |
                                       'SET_REPLAY_RATE' | 'REVERSE_REPLAY_RATE' |
                                       'SET_WINDOW' | 'PROPOSE_WINDOW' | 'COMMIT_WINDOW' | 'RELEASE_WINDOW' | 'TOGGLE_WINDOW_SYNC' |
                                       'TICK' |
                                       'TOGGLE_PLAYBACK' | 'SET_CURRENT_FRAME' | 'SKIP' | 'TO_END'

export type AnimationStateAction<T> =
    AnimationStateSetDispatchAction |
    AnimationStateUpdateFrameDataAction<T> |
    AnimationStateSetBaseMsPerFrameAction |
    AnimationStateSetReplayRateAction |
    AnimationStateReverseReplayRateAction |
    AnimationStateSetWindowAction |
    AnimationStateProposeWindowAction |
    AnimationStateCommitWindowAction |
    AnimationStateReleaseWindowAction |
    AnimationStateToggleWindowSyncAction |
    AnimationStateTickAction |
    AnimationStateTogglePlaybackAction |
    AnimationStateSetCurrentFrameAction |
    AnimationStateSkipAction |
    AnimationStateToEndAction

export type AnimationStateSetDispatchAction = {
    type: 'SET_DISPATCH'
    animationDispatchFn: ((calltime: number) => void)
}

export type AnimationStateUpdateFrameDataAction<T> = {
    type: 'UPDATE_FRAME_DATA'
    incomingFrames: T[]
    replaceExistingFrames?: boolean
}

export type AnimationStateSetBaseMsPerFrameAction = {
    type: 'SET_BASE_MS_PER_FRAME',
    baseMsPerFrame: number
}

export type AnimationStateSetReplayRateAction = {
    type: 'SET_REPLAY_RATE',
    newRate: number
}

export type AnimationStateReverseReplayRateAction = {
    type: 'REVERSE_REPLAY_RATE'
}

export type AnimationStateSetWindowAction = {
    type: 'SET_WINDOW'
    bounds?: [number, number]
}

export type AnimationStateProposeWindowAction = {
    type: 'PROPOSE_WINDOW'
    bounds?: [number, number]
}

export type AnimationStateCommitWindowAction = {
    type: 'COMMIT_WINDOW'
}

export type AnimationStateReleaseWindowAction = {
    type: 'RELEASE_WINDOW'
}

export type AnimationStateToggleWindowSyncAction = {
    type: 'TOGGLE_WINDOW_SYNC'
}

export type AnimationStateTickAction = {
    type: 'TICK'
    now: number
}

export type AnimationStateTogglePlaybackAction = {
    type: 'TOGGLE_PLAYBACK'
}

export type AnimationStateSetCurrentFrameAction = { 
    type: 'SET_CURRENT_FRAME',
    newIndex: number
}

export type AnimationStateSkipAction = {
    type: 'SKIP'
    backward?: boolean
    fineSteps?: number
    frameByFrame?: boolean
}

export type AnimationStateToEndAction = {
    type: 'TO_END'
    backward?: boolean
}

export const SET_DISPATCH: AnimationStateActionType = 'SET_DISPATCH'
export const UPDATE_FRAME_DATA: AnimationStateActionType = 'UPDATE_FRAME_DATA'
export const SET_WINDOW: AnimationStateActionType = 'SET_WINDOW'
export const PROPOSE_WINDOW: AnimationStateActionType = 'PROPOSE_WINDOW'
export const COMMIT_WINDOW: AnimationStateActionType = 'COMMIT_WINDOW'
export const RELEASE_WINDOW: AnimationStateActionType = 'RELEASE_WINDOW'
export const TOGGLE_WINDOW_SYNC: AnimationStateActionType = 'TOGGLE_WINDOW_SYNC'
export const TICK: AnimationStateActionType = 'TICK'
export const TOGGLE_PLAYBACK: AnimationStateActionType = 'TOGGLE_PLAYBACK'
export const SET_CURRENT_FRAME: AnimationStateActionType = 'SET_CURRENT_FRAME'
export const SET_BASE_MS_PER_FRAME: AnimationStateActionType = 'SET_BASE_MS_PER_FRAME'
export const SET_REPLAY_RATE: AnimationStateActionType = 'SET_REPLAY_RATE'
export const REVERSE_REPLAY_RATE: AnimationStateActionType = 'REVERSE_REPLAY_RATE'
export const SKIP: AnimationStateActionType = 'SKIP'
export const TO_END: AnimationStateActionType = 'TO_END'

// TODO: Is this really needed? It really only serves to type the frame data.
export const makeDefaultState = <T, >(): AnimationState<T> => {
    return {
        frameData: [],
        window: [0, 0],
        windowSynced: false,
        replayMultiplier: 1,
        isPlaying: false,
        currentFrameIndex: 0,
        playbackStartedTimestamp: undefined,
        playbackStartedFrameIndex: 0,
        pendingFrameCode: undefined,
        baseMsPerFrame: MS_PER_TICK_60HZ,
        animationDispatchFn: undefined
    }
}

// This produces a function that conforms with the expectations of requestAnimationFrame() and still
// knows how to continue ticking the state's clock.
export const curryDispatch = <T, >(dispatch: React.Dispatch<AnimationStateAction<T>>) => {
    const curried = (calltime: number) => {
        const tickAction = {
            type: 'TICK',
            now: calltime,
            curriedDispatchFn: curried
        } as AnimationStateAction<T>
        dispatch(tickAction)
    }
    return curried
}


//////// The main event
const AnimationStateReducer = <T, >(s: AnimationState<T>, a: AnimationStateAction<T>): AnimationState<T> => {
    const { type } = a
    switch (type) {
        case SET_DISPATCH:
            return {...s, animationDispatchFn: a.animationDispatchFn}
        case UPDATE_FRAME_DATA:
            return updateFrames(s, a)
        case SET_BASE_MS_PER_FRAME:
            if (a.baseMsPerFrame === 0) {
                console.warn('Attempt to set ms-per-frame to 0.')
                return s
            }
            // refreshAnimationCycle(s)
            return { ...s, baseMsPerFrame: a.baseMsPerFrame, playbackStartedTimestamp: undefined }
        case SET_REPLAY_RATE:
            // Negative values are allowed and will just play it backwards.
            if (a.newRate === 0) {
                console.warn(`Attempt to set new replay rate to 0.`)
                return s
            }
            // refreshAnimationCycle(s)
            return { ...s, replayMultiplier: a.newRate, playbackStartedTimestamp: undefined }
        case REVERSE_REPLAY_RATE:
            return { ...s, replayMultiplier: -1 * s.replayMultiplier, playbackStartedTimestamp: undefined }
        case SET_WINDOW:
            return setWindow(s, a)
        case PROPOSE_WINDOW:
            return setProposedWindow(s, a)
        case COMMIT_WINDOW:
            // Operates as a non-deleting toggle if we are currently zoomed to the exact proposal
            if (s.windowProposal && s.windowProposal[0] === s.window[0] && s.windowProposal[1] === s.window[1])
                return setWindow(s, {type: SET_WINDOW, bounds: undefined})
            return setWindow(s, {type: SET_WINDOW, bounds: s.windowProposal})
        case RELEASE_WINDOW:
            return setWindow(s, {type: SET_WINDOW, bounds: undefined})
        case TOGGLE_WINDOW_SYNC:
            return { ...s, windowSynced: !s.windowSynced, windowProposal: undefined }
        case TICK:
            return doTick(s, a)
        case TOGGLE_PLAYBACK:
            return togglePlayState(s)
        case SET_CURRENT_FRAME:
            return setFrame(s, a)
        case SKIP:
            return doSkip(s, a)
        case TO_END:
            s.currentFrameIndex = a.backward ? s.window[0] : s.window[1]
            // refreshAnimationCycle(s)
            return {...s, playbackStartedTimestamp: undefined}
        default: {
            throw Error(`Invalid action type for animation state reducer: ${type}`)
        }
    }
}


const updateFrames = <T, >(s: AnimationState<T>, a: AnimationStateUpdateFrameDataAction<T>): AnimationState<T> => {
    if (a.replaceExistingFrames) {
        s.frameData = a.incomingFrames
    } else {
        // apparently iteratively inserting these is orders of magnitude faster than using the concat function,
        // but the reference is pretty old, so we should consider profiling this
        a.incomingFrames.forEach(frame => s.frameData.push(frame))
    }
    return setWindow(s, { type: SET_WINDOW })
}


const setWindow = <T, >(s: AnimationState<T>, a: AnimationStateSetWindowAction): AnimationState<T> => {
    const { bounds } = a
    const visibleWindow: [number, number] = bounds === undefined
        ? [0, s.frameData.length - 1]
        : [Math.max(Math.min(...bounds), 0), Math.min(Math.max(...bounds), s.frameData.length - 1)]

    // Don't update if no change
    if (visibleWindow[0] === s.window[0] && visibleWindow[1] === s.window[1]) return s
    s.currentFrameIndex = Math.min(visibleWindow[1], Math.max(s.currentFrameIndex, visibleWindow[0]))
    s.playbackStartedTimestamp = undefined
    return { ...s, window: visibleWindow }
}


const setProposedWindow = <T, >(s: AnimationState<T>, a: AnimationStateProposeWindowAction): AnimationState<T> => {
    const { bounds } = a
    const { window, windowProposal: currentProposal } = s
    if (bounds === undefined || bounds.length !== 2) return currentProposal ? { ...s, windowProposal: undefined } : s
    const newProposal = [Math.max(bounds[0], window[0]), Math.min(bounds[1], window[1])] as [number, number]
    if (currentProposal && newProposal[0] === currentProposal[0] && newProposal[1] === currentProposal[1]) return s
    return {...s, windowProposal: newProposal}
}


const doTick = <T, >(s: AnimationState<T>, a: AnimationStateTickAction): AnimationState<T> => {
    if (s.animationDispatchFn === undefined) {
        console.warn('Attempt to animate, but no dispatch function set. No-op.')
        return s
    }
    if (!s.isPlaying) {
        // Shouldn't happen, but these sometimes slip through on rapid interactions.
        console.log(`Caught unexpected tick while theoretically paused.`)
        s.pendingFrameCode && window.cancelAnimationFrame(s.pendingFrameCode)
        s.pendingFrameCode = undefined
        return {...s}
    }
    if (s.playbackStartedTimestamp) {
        const elapsedMs = a.now - s.playbackStartedTimestamp
        if (elapsedMs < 0) {
            console.warn(`Doing animation tick, but elapsed time is somehow negative: ${a.now} - ${s.playbackStartedTimestamp} = ${elapsedMs}`)
            return s
        }
        const rawElapsedFrames = elapsedMs/s.baseMsPerFrame * s.replayMultiplier
        const elapsedFrames = s.replayMultiplier > 0 ? Math.floor(rawElapsedFrames) : Math.ceil(rawElapsedFrames)
        s.currentFrameIndex = Math.max(s.window[0], Math.min((s.window[1]), s.playbackStartedFrameIndex + elapsedFrames))
    } else {
        s.playbackStartedTimestamp = a.now
        s.playbackStartedFrameIndex = s.currentFrameIndex
    }

    if (((s.currentFrameIndex === s.window[1]) && s.replayMultiplier > 0) || ((s.currentFrameIndex === s.window[0]) && s.replayMultiplier < 0)) {
        return togglePlayState(s)
    }
    return {...s, pendingFrameCode: window.requestAnimationFrame(s.animationDispatchFn)}
}

const togglePlayState = <T, >(s: AnimationState<T>): AnimationState<T> => {
    if (s.isPlaying) {
        s.pendingFrameCode && window.cancelAnimationFrame(s.pendingFrameCode)
        s.pendingFrameCode = undefined
        s.playbackStartedTimestamp = undefined // The old value doesn't matter, since we can't time anything with it after pause.
        s.playbackStartedFrameIndex = s.currentFrameIndex
    } else {
        if (!s.animationDispatchFn) {
            console.warn('Toggling play state to active, but no dispatch function set up. No-op.')
            return s
        }
        s.pendingFrameCode = window.requestAnimationFrame(s.animationDispatchFn)
    }
    s.isPlaying = !s.isPlaying
    return {...s}
}

const setFrame = <T, >(s: AnimationState<T>, a: AnimationStateSetCurrentFrameAction): AnimationState<T> => {
    const { newIndex } = a
    if (newIndex < 0) {
        console.warn(`Attempt to set playback index to negative value ${newIndex}. No-op.`)
        return s
    }
    if (newIndex < s.window[0] || newIndex > s.window[1]) {
        console.log(`Note: attempt to set current frame outside window (to ${newIndex} vs (${s.window[0]}, ${s.window[1]})). No-op for now.`)
        return s
    }
    if (newIndex === s.currentFrameIndex) {
        // attempt to set index to current frame index--no-op.
        // Return the input state to avoid causing rerenders anywhere.
        return s
    }
    if (0 < newIndex && newIndex < 1) {
        const i = Math.floor((s.window[1] - s.window[0]) * newIndex)
        s.currentFrameIndex = i
    } else {
        s.currentFrameIndex = Math.min(newIndex, s.window[1])
    }
    if (s.playbackStartedTimestamp) {
        s.playbackStartedTimestamp = undefined
    }
    return {...s}
}

const msPerFineSkip = 100
const minStepSize = 1
const coarseStepSizePct = 0.03
/**
 * Skip forward/backward by a defined amount controlled by the skip action parameters and the playback speed.
 * This is controlled by `AnimationStateSkipAction.fineSteps`:
 * - When `fineSteps` is unset, *coarse* skip is used. This is currently a jump of 3%
 * of the total recording length (but consider making it 5 sec of current playback speed).
 * - When `fineSteps` is set, *fine* skip is used. The step rate is:
 *    - if `AnimationStateSkipAction.frameByFrame` is true, then each step is one frame.
 *    - Otherwise, each step is 1/10 of a second of playback at the current speed (min 1 frame).
 *   The per-step skip rate is multiplied by the number of fine steps requested (for debouncing mouse wheel controls).
 * - If `fineSteps` is a 0 value, the function returns the input state (a no-op).
 * @param s Current animation state
 * @param a Skip action
 * @returns Updated animation state.
 */
const doSkip = <T, >(s: AnimationState<T>, a: AnimationStateSkipAction): AnimationState<T> => {
    const { backward, fineSteps, frameByFrame } = a
    const windowLength = s.window[1] - s.window[0]

    if (windowLength === 0) {
        // Attempting to navigate in a 0-width frame. no-op.
        return s
    }
    if (fineSteps !== undefined && fineSteps === 0) {
        // No steps requested. No-op: return identity.
        return s
    }
    const frameSkipCount = fineSteps
        ? fineSteps * (frameByFrame
                        ? minStepSize
                        : (Math.max((Math.round(s.replayMultiplier * msPerFineSkip/s.baseMsPerFrame)), minStepSize)))
        : (Math.floor(windowLength * coarseStepSizePct))

    const newFrame = s.currentFrameIndex + (frameSkipCount * (backward ? -1 : 1))

    const targetFrameIndex = newFrame < s.window[0]
        ? s.window[0]
        : newFrame > s.window[1]
            ? s.window[1] : newFrame
    // refreshAnimationCycle(s)
    return {...s, currentFrameIndex: targetFrameIndex, playbackStartedTimestamp: undefined}
}

export default AnimationStateReducer
