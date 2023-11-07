import { BstSearchFn, BstSearchResult, useBinarySearchTree } from "../../../core-utils"
import React, { useCallback, useMemo, useRef } from "react"
import { AnimationState, AnimationStateAction } from "../../util-animation"
import { DebounceThrottleResolver, DebounceThrottleUpdater, useThrottler } from "../../util-rate-limiters"


type TimeLookupFn = (time: number) => BstSearchResult<number> | undefined
type debounceUpdateRefs = { targetExternalTimeRef: React.MutableRefObject<number | undefined> }
type debounceUpdateProps = { currentTime: number | undefined }
type debounceUpdateResolverProps = { committer: (time: number | undefined, setTimeFocus: timeSetter) => void, setterFn: timeSetter }
type timeSetter = (time: number, o?: any) => void


const timeComparison = (a: number, b: number) => a - b
const throttleRateMs = 100


const snapTimeToGrid = (time: number, searchFn: BstSearchFn<number>) => {
    const nearestTime = searchFn(time)
    return nearestTime
}


export const syncOutsideTimeToFrameTime = (animationCurrentTime: number | undefined, setOutsideTime: (time: number, o: {autoScrollVisibleTimeRange?: boolean}) => void) => {
    const currentTime = animationCurrentTime
    if (currentTime === undefined) return
    setOutsideTime(currentTime, {autoScrollVisibleTimeRange: true})
}


export const syncFrameToOutsideTime = (outsideTime: number | undefined, findNearestTime: TimeLookupFn, animationStateDispatch: React.Dispatch<AnimationStateAction<any>>) => {
    if (outsideTime === undefined) return
    const matchingIndex = findNearestTime(outsideTime)?.baseListIndex
    if (matchingIndex === undefined) return
    animationStateDispatch({
        type: 'SET_CURRENT_FRAME',
        newIndex: matchingIndex
    })
}


export const useTimeLookupFn = <T, >(animationState: AnimationState<T>, getTimeFromFrame: (frame: T) => number) => {
    // TODO: Is this updating too often?
    const realizedTimestamps = useMemo(() => animationState.frameData.map(d => getTimeFromFrame(d)), [animationState.frameData, getTimeFromFrame])
    const timeSearchFn = useBinarySearchTree<number>(realizedTimestamps, timeComparison) // do not use an anonymous fn here--results in constant refreshes
    const findNearestTime = useCallback((time: number) => {
        return snapTimeToGrid(time, timeSearchFn)
    }, [timeSearchFn])
    
    return findNearestTime
}


type liveSyncFrameToOutsideTimeProps = {
    outsideTime: number | undefined
    checkNewTimeWithinEpsilon: (currentTime: number | undefined, replayRateMultiplier: number) => boolean
    multiplier: number
    cancelPendingUpdateOfOutsideTime: () => void
    findNearestTime: (time: number) => BstSearchResult<number> | undefined
    dispatch: React.Dispatch<AnimationStateAction<any>>
}
export const liveSyncFrameToOutsideTime = (props: liveSyncFrameToOutsideTimeProps) => {
    const { outsideTime, checkNewTimeWithinEpsilon, multiplier, cancelPendingUpdateOfOutsideTime, findNearestTime, dispatch: animationStateDispatch } = props
    if (checkNewTimeWithinEpsilon(outsideTime, multiplier)) return
    cancelPendingUpdateOfOutsideTime()
    syncFrameToOutsideTime(outsideTime, findNearestTime, animationStateDispatch)
}


// ********* Throttling code for real-time updates

const timeUpdater: DebounceThrottleUpdater<debounceUpdateProps, debounceUpdateRefs> = (refs, state) => {
    if (state.currentTime === refs.targetExternalTimeRef.current) return false
    refs.targetExternalTimeRef.current = state.currentTime
    return true
}
const timeResolver: DebounceThrottleResolver<debounceUpdateRefs, debounceUpdateResolverProps> = (refs, props) => {
    // It looks like this is actually getting called too often--not sure what's going on there.
    props.committer(refs.targetExternalTimeRef.current, props.setterFn)
}

const checkNewTimeIsWithinEpsilon = (scheduledNewTimeRef: React.MutableRefObject<number | undefined>, frameTime: number | undefined, replayRateMultiplier: number) => {
    if (scheduledNewTimeRef.current === undefined || frameTime === undefined) return false
    // At 1:1 playback, we expect ~100 ms to pass between 100-ms-throttled focus-update calls. Just need to multiply by replay rate multiplier.
    const epsilon = Math.abs(throttleRateMs * replayRateMultiplier * 1.5 * .001) // the 1.5 multiplier gives us a bit of fudge, while .001 converts MS to S.
    return Math.abs(scheduledNewTimeRef.current - frameTime) < epsilon
}

const useLiveTimeSyncing = <T, >(setExternalTime: timeSetter, state: AnimationState<T>, dispatch: React.Dispatch<AnimationStateAction<T>>, getTimeFromFrame: (frame: T) => number) => {
    const targetExternalTimeRef = useRef<number | undefined>(undefined)
    const refs: debounceUpdateRefs = useMemo(() => { return { targetExternalTimeRef }}, [targetExternalTimeRef])
    const findNearestTime = useTimeLookupFn(state, getTimeFromFrame)
    const resolverProps = useMemo(() => { return { committer: syncOutsideTimeToFrameTime, setterFn: setExternalTime }  }, [setExternalTime])
    const { throttler: throttledSyncOutsideTimeToFrameTime, cancelThrottled } = useThrottler(timeUpdater, timeResolver, refs, resolverProps, throttleRateMs)

    const epsilonCheck = useCallback(
        (frameTime: number | undefined, replayRateMultiplier: number) => checkNewTimeIsWithinEpsilon(refs.targetExternalTimeRef, frameTime, replayRateMultiplier),
        [refs])

    const handleOutsideTimeUpdate = useCallback((otherTime: number | undefined) => liveSyncFrameToOutsideTime({
        outsideTime: otherTime,
        checkNewTimeWithinEpsilon: epsilonCheck,
        multiplier: state.replayMultiplier,
        cancelPendingUpdateOfOutsideTime: cancelThrottled,
        findNearestTime,
        dispatch
    }), [epsilonCheck, state.replayMultiplier, cancelThrottled, findNearestTime, dispatch])

    const handleFrameTimeUpdate = useCallback(() => {
        const internalTime = getTimeFromFrame(state?.frameData[state?.currentFrameIndex])
        throttledSyncOutsideTimeToFrameTime({currentTime: internalTime})
    }, [getTimeFromFrame, state.frameData, state.currentFrameIndex, throttledSyncOutsideTimeToFrameTime])

    return { handleOutsideTimeUpdate, handleFrameTimeUpdate }
}




export default useLiveTimeSyncing

