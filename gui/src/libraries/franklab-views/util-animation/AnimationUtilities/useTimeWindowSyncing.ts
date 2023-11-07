import { useTimeRange } from '../../../timeseries-views'
import React, { useEffect } from "react"
import { AnimationState, AnimationStateAction } from '../../util-animation'
import { useTimeLookupFn } from '../../util-animation'


const useTimeWindowSyncing = <T, >(state: AnimationState<T>, dispatch: React.Dispatch<AnimationStateAction<T>>, getTimeFromFrame: (frame: T) => number) => {
    const { visibleStartTimeSec, visibleEndTimeSec } = useTimeRange()
    const findNearestTime = useTimeLookupFn(state, getTimeFromFrame)
    useEffect(() => {
        if (!state.windowSynced) return
        const windowBounds: [number, number] | undefined = (visibleStartTimeSec === undefined || visibleEndTimeSec === undefined)
            ? undefined
            : [(findNearestTime(visibleStartTimeSec)?.baseListIndex) as number, (findNearestTime(visibleEndTimeSec)?.baseListIndex) as number]
        if (windowBounds) { // Narrow the animation window if "closest frame" falls outside the range due to rounding. Avoids weird sync behavior.
            windowBounds[0] += getTimeFromFrame(state.frameData[windowBounds[0]]) < (visibleStartTimeSec ?? 0) ?  1 : 0
            windowBounds[1] += getTimeFromFrame(state.frameData[windowBounds[1]]) > ( visibleEndTimeSec  ?? 0) ? -1 : 0
        }
        dispatch({ type: 'SET_WINDOW', bounds: windowBounds })
    }, [visibleStartTimeSec, visibleEndTimeSec, dispatch, findNearestTime, state.windowSynced, state.frameData, getTimeFromFrame])
    useEffect(() => {
        // Reset to full recording when we turn off syncing
        if (state.windowSynced) return
        dispatch({ type: 'SET_WINDOW', bounds: undefined })
    }, [state.windowSynced, dispatch])
}


export default useTimeWindowSyncing