import { Reducer, useEffect, useRef } from "react"

const TIME_ZOOM_FACTOR = 1.4
const AMP_SCALE_FACTOR = 1.4

export type WaveformsMode = 'geom' | 'vertical'

export interface RecordingSelection {
    selectedElectrodeIds?: number[]
    visibleElectrodeIds?: number[]
    currentTimepoint?: number
    timeRange?: {min: number, max: number} | null
    ampScaleFactor?: number
    numTimepoints?: number
    animation?: {
        currentTimepointVelocity: number // timepoints per second
    }
    waveformsMode?: WaveformsMode
}

export const useRecordingAnimation = (selection: RecordingSelection, selectionDispatch: RecordingSelectionDispatch) => {
    const ref = useRef({
        lastUpdateTimestamp: Number(new Date()),
        selection,
        selectionDispatch
    })
    ref.current.selection = selection
    ref.current.selectionDispatch = selectionDispatch

    const animationFrame = () => {
        const lastUpdate = ref.current.lastUpdateTimestamp
        const current = Number(new Date())
        const elapsed = current - lastUpdate
        if (elapsed !== 0) {
            const currentTimepointVelocity = ref.current.selection.animation?.currentTimepointVelocity || 0
            const currentTimepoint = ref.current.selection.currentTimepoint
            if ((currentTimepointVelocity) && (currentTimepoint !== undefined)) {
                const t = Math.round(currentTimepoint + currentTimepointVelocity * (elapsed / 1000))
                ref.current.selectionDispatch({type: 'SetCurrentTimepoint', currentTimepoint: t})
            }
        }
        ref.current.lastUpdateTimestamp = Number(new Date())
    }

    // only do this once
    useEffect(() => {
        ;(async () => {
            while (true) {
                await sleepMsec(50)
                animationFrame()
            }
        })()
    }, [])
}

export const sleepMsec = (m: number) => new Promise(r => setTimeout(r, m));

export type RecordingSelectionDispatch = (action: RecordingSelectionAction) => void

type SetRecordingSelectionRecordingSelectionAction = {
    type: 'SetRecordingSelection',
    recordingSelection: RecordingSelection
}

type SetSelectedElectrodeIdsRecordingSelectionAction = {
    type: 'SetSelectedElectrodeIds',
    selectedElectrodeIds: number[]
}

type SetVisibleElectrodeIdsRecordingSelectionAction = {
    type: 'SetVisibleElectrodeIds',
    visibleElectrodeIds: number[]
}

type SetCurrentTimepointRecordingSelectionAction = {
    type: 'SetCurrentTimepoint',
    currentTimepoint: number | null,
    ensureInRange?: boolean
}

type SetNumTimepointsRecordingSelectionAction = {
    type: 'SetNumTimepoints',
    numTimepoints: number
}

type SetTimeRangeRecordingSelectionAction = {
    type: 'SetTimeRange',
    timeRange: {min: number, max: number} | null
}

type ZoomTimeRangeRecordingSelectionAction = {
    type: 'ZoomTimeRange',
    factor?: number             // uses default if unset
    direction?: 'in' | 'out'    // default direction is 'in'. If direction is set to 'out', 'factor' is inverted.
}

type SetAmpScaleFactorRecordingSelectionAction = {
    type: 'SetAmpScaleFactor',
    ampScaleFactor: number
}

type ScaleAmpScaleFactorRecordingSelectionAction = {
    type: 'ScaleAmpScaleFactor',
    multiplier?: number         // uses default if unset
    direction?: 'up' | 'down'   // default direction is 'up'. If direction is set to 'down', multiplier is inverted.
}

type SetCurrentTimepointVelocityRecordingSelectionAction = {
    type: 'SetCurrentTimepointVelocity',
    velocity: number // timepoints per second
}

type SetWaveformsModeRecordingSelectionAction = {
    type: 'SetWaveformsMode',
    waveformsMode: 'geom' | 'vertical'
}

type SetRecordingSelectionAction = {
    type: 'Set',
    state: RecordingSelection
}

type TimeShiftFrac = {
    type: 'TimeShiftFrac'
    frac: number
}

export type RecordingSelectionAction = SetRecordingSelectionRecordingSelectionAction | SetSelectedElectrodeIdsRecordingSelectionAction | SetVisibleElectrodeIdsRecordingSelectionAction | SetNumTimepointsRecordingSelectionAction | SetCurrentTimepointRecordingSelectionAction | SetTimeRangeRecordingSelectionAction | ZoomTimeRangeRecordingSelectionAction | SetAmpScaleFactorRecordingSelectionAction | ScaleAmpScaleFactorRecordingSelectionAction | SetCurrentTimepointVelocityRecordingSelectionAction | SetWaveformsModeRecordingSelectionAction | SetRecordingSelectionAction | TimeShiftFrac

const adjustTimeRangeToIncludeTimepoint = (timeRange: {min: number, max: number}, timepoint: number) => {
    if ((timeRange.min <= timepoint) && (timepoint < timeRange.max)) return timeRange
    const span = timeRange.max - timeRange.min
    const t1 = Math.max(0, Math.floor(timepoint - span / 2))
    const t2 = t1 + span
    return {min: t1, max: t2}
}

export const recordingSelectionReducer: Reducer<RecordingSelection, RecordingSelectionAction> = (state: RecordingSelection, action: RecordingSelectionAction): RecordingSelection => {
    if (action.type === 'SetRecordingSelection') {
        return {...action.recordingSelection}
    }
    else if (action.type === 'SetSelectedElectrodeIds') {
        return {
            ...state,
            selectedElectrodeIds: action.selectedElectrodeIds.filter(eid => ((!state.visibleElectrodeIds) || (state.visibleElectrodeIds.includes(eid))))
        }
    }
    else if (action.type === 'SetVisibleElectrodeIds') {
        return {
            ...state,
            visibleElectrodeIds: action.visibleElectrodeIds,
            selectedElectrodeIds: state.selectedElectrodeIds ? state.selectedElectrodeIds.filter(eid => (action.visibleElectrodeIds.includes(eid))) : undefined
        }
    }
    else if (action.type === 'SetNumTimepoints') {
        return {
            ...state,
            numTimepoints: action.numTimepoints
        }
    }
    else if (action.type === 'SetCurrentTimepoint') {
        return {
            ...state,
            currentTimepoint: action.currentTimepoint || undefined,
            timeRange: action.ensureInRange && (state.timeRange) && (action.currentTimepoint !== null) ? adjustTimeRangeToIncludeTimepoint(state.timeRange, action.currentTimepoint) : state.timeRange
        }
    }
    else if (action.type === 'SetTimeRange') {
        return fix({
            ...state,
            timeRange: action.timeRange
        })
    }
    else if (action.type === 'ZoomTimeRange') {
        const maxTimeSpan = 30000 * 60 * 5
        const currentTimepoint = state.currentTimepoint
        const timeRange = state.timeRange
        if (!timeRange) return state
        const direction = action.direction ?? 'in'
        const pre_factor = action.factor ?? TIME_ZOOM_FACTOR
        const factor = direction === 'out' ? 1 / pre_factor : pre_factor
        
        if ((timeRange.max - timeRange.min) / factor > maxTimeSpan ) return state
        let t: number
        if ((currentTimepoint === undefined) || (currentTimepoint < timeRange.min))
            t = timeRange.min
        else if (currentTimepoint > timeRange.max)
            t = timeRange.max
        else
            t = currentTimepoint
        const newTimeRange = zoomTimeRange(timeRange, factor, t)
        return fix({
            ...state,
            timeRange: newTimeRange
        })
    }
    else if (action.type === 'SetAmpScaleFactor') {
        return {
            ...state,
            ampScaleFactor: action.ampScaleFactor
        }
    }
    else if (action.type === 'ScaleAmpScaleFactor') {
        const direction = action.direction ?? 'up'
        const pre_multiplier = action.multiplier ?? AMP_SCALE_FACTOR
        const multiplier = direction === 'down' ? 1 / pre_multiplier : pre_multiplier
        return {
            ...state,
            ampScaleFactor: (state.ampScaleFactor || 1) * multiplier
        }
    }
    else if (action.type === 'SetCurrentTimepointVelocity') {
        return {
            ...state,
            animation: {
                ...(state.animation || {}),
                currentTimepointVelocity: action.velocity
            }
        }
    }
    else if (action.type === 'SetWaveformsMode') {
        return {
            ...state,
            waveformsMode: action.waveformsMode
        }
    }
    else if (action.type === 'TimeShiftFrac') {
        const timeRange = state.timeRange
        const currentTimepoint = state.currentTimepoint
        if (!timeRange) return state
        const span = timeRange.max - timeRange.min
        const shift = Math.floor(span * action.frac)
        const newTimeRange = shiftTimeRange(timeRange, shift)
        const newCurrentTimepoint = currentTimepoint !== undefined ? currentTimepoint + shift : undefined
        return fix({
            ...state,
            currentTimepoint: newCurrentTimepoint,
            timeRange: newTimeRange
        })
    }
    else if (action.type === 'Set') {
        return action.state
    }
    else return state
}

const zoomTimeRange = (timeRange: {min: number, max: number}, factor: number, anchorTime: number): {min: number, max: number} => {
    const oldT1 = timeRange.min
    const oldT2 = timeRange.max
    const t1 = anchorTime + (oldT1 - anchorTime) / factor
    const t2 = anchorTime + (oldT2 - anchorTime) / factor
    return {min: Math.floor(t1), max: Math.floor(t2)}
}

const fix = (s: RecordingSelection): RecordingSelection => {
    if (!s.numTimepoints) return s
    if (!s.timeRange) return s
    let newTimeRange = {...s.timeRange}
    if (newTimeRange.max > s.numTimepoints) {
        const delta = -(newTimeRange.max - s.numTimepoints)
        newTimeRange = {min: newTimeRange.min + delta, max: newTimeRange.max + delta}
    }
    if (newTimeRange.min < 0) {
        const delta = -newTimeRange.min
        newTimeRange = {min: newTimeRange.min + delta, max: newTimeRange.max + delta}
    }
    if (newTimeRange.max > s.numTimepoints) {
        newTimeRange.max = s.numTimepoints
    }
    return {...s, timeRange: newTimeRange}
}

const shiftTimeRange = (timeRange: {min: number, max: number}, shift: number): {min: number, max: number} => {
    return {
        min: Math.floor(timeRange.min + shift),
        max: Math.floor(timeRange.max + shift)
    }
}