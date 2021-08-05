import { UserId } from "kachery-js/types/kacheryTypes"
import { Recording } from "./Recording"
import { Sorting } from "./Sorting"
import { SortingCuration, SortingCurationAction } from "./SortingCuration"


export type WorkspaceState = {
    recordings: Recording[]
    sortings: Sorting[]
    userPermissions: {[key: string]: {edit?: boolean}}
    snippetLen?: [number, number]
}

export const initialWorkspaceState: WorkspaceState = {recordings: [], sortings: [], userPermissions: {}, snippetLen: undefined}

type AddRecordingWorkspaceAction = {
    type: 'ADD_RECORDING'
    recording: Recording
}

type DeleteRecordingsWorkspaceAction = {
    type: 'DELETE_RECORDINGS'
    recordingIds: string[]
}

type AddSortingsWorkspaceAction = {
    type: 'ADD_SORTING'
    sorting: Sorting
}

type DeleteSortingsWorkspaceAction = {
    type: 'DELETE_SORTINGS'
    sortingIds: string[]
}

type DeleteSortingsForRecordingsWorkspaceAction = {
    type: 'DELETE_SORTINGS_FOR_RECORDINGS'
    recordingIds: string[]
}

export interface SetUnitMetricsForSortingWorkspaceAction {
    type: 'SET_UNIT_METRICS_FOR_SORTING'
    unitMetricsForSorting: {
        sortingId: string
        metricsUri: string
    }
}

type SetUserPermissionsAction = {
    type: 'SET_USER_PERMISSIONS'
    userId: UserId
    permissions: {
        edit?: boolean
    }
}

type SetsnippetLenWorkspaceAction = {
    type: 'SET_SNIPPET_LEN'
    snippetLen?: [number, number]
}


export type WorkspaceAction = AddRecordingWorkspaceAction | DeleteRecordingsWorkspaceAction | AddSortingsWorkspaceAction | DeleteSortingsWorkspaceAction | DeleteSortingsForRecordingsWorkspaceAction | SetUnitMetricsForSortingWorkspaceAction | SetUserPermissionsAction | SetsnippetLenWorkspaceAction

export const sortingCurationReducer = (state: SortingCuration, action: SortingCurationAction): SortingCuration => {
    // disable state changes for a closed curation
    if (action.type !== 'REOPEN_CURATION' && state.isClosed) {
        console.log(`WARNING: Attempt to curate a closed sorting curation:\n\tAction: ${action.type}`)
        return state
    }

    if (action.type === 'SET_CURATION') {
        return action.curation
    }
    else if (action.type === 'CLOSE_CURATION') {
        return { ...state, isClosed: true }
    }
    else if (action.type === 'REOPEN_CURATION') {
        return { ...state, isClosed: false }
    }
    else if (action.type === 'ADD_UNIT_LABEL') {
        const uids: number[] = typeof(action.unitId) === 'object' ? action.unitId : [action.unitId]
        const newLabelsByUnit = {...(state.labelsByUnit || {})}
        let somethingChanged = false
        for (let uid of uids) {
            const labels = newLabelsByUnit[uid + ''] || []
            if (!labels.includes(action.label)) {
                somethingChanged = true
                newLabelsByUnit[uid + ''] = [...labels, action.label].sort()
            }
        }
        if (somethingChanged) {
            return {
                ...state,
                labelsByUnit: newLabelsByUnit
            }
        }
        else return state
    }
    else if (action.type === 'REMOVE_UNIT_LABEL') {
        const uids: number[] = typeof(action.unitId) === 'object' ? action.unitId : [action.unitId]
        const newLabelsByUnit = {...(state.labelsByUnit || {})}
        let somethingChanged = false
        for (let uid of uids) {
            const labels = newLabelsByUnit[uid + ''] || []
            if (labels.includes(action.label)) {
                somethingChanged = true
                newLabelsByUnit[uid + ''] = labels.filter(l => (l !== action.label))
            }
        }
        if (somethingChanged) {
            return {
                ...state,
                labelsByUnit: newLabelsByUnit
            }
        }
        else return state
    }
    else if (action.type === 'MERGE_UNITS') {
        return {
            ...state,
            mergeGroups: simplifyMergeGroups([...(state.mergeGroups || []), action.unitIds])
        }
    }
    else if (action.type === 'UNMERGE_UNITS') {
        return {
            ...state,
            mergeGroups: simplifyMergeGroups((state.mergeGroups || []).map(g => (g.filter(x => (!action.unitIds.includes(x))))))
        }
    }
    else return state
}

export const workspaceReducer = (s: WorkspaceState, a: WorkspaceAction): WorkspaceState => {
    switch (a.type) {
        case 'ADD_RECORDING': return { ...s, recordings: [...s.recordings.filter(r => (r.recordingId !== a.recording.recordingId)), a.recording] }
        case 'DELETE_RECORDINGS': return { ...s, recordings: s.recordings.filter(x => !a.recordingIds.includes(x.recordingId)) }
        case 'ADD_SORTING': return { ...s, sortings: [...s.sortings.filter(x => (x.sortingId !== a.sorting.sortingId)), a.sorting] }
        case 'DELETE_SORTINGS': return { ...s, sortings: s.sortings.filter(x => !a.sortingIds.includes(x.sortingId)) }
        case 'DELETE_SORTINGS_FOR_RECORDINGS': return { ...s, sortings: s.sortings.filter(x => !a.recordingIds.includes(x.recordingId)) }
        case 'SET_USER_PERMISSIONS': return {...s, userPermissions: {...s.userPermissions, [a.userId.toString()]: a.permissions}}
        // case 'ADD_UNIT_LABEL':
        // case 'REMOVE_UNIT_LABEL':
        // case 'MERGE_UNITS':
        // case 'UNMERGE_UNITS':
        //     return {...s, sortings: s.sortings.map(x => (x.sortingId === a.sortingId) ? {...x, curation?: SortingCurationReducer(x.curation || {}, a)} : x)}
        case 'SET_UNIT_METRICS_FOR_SORTING':
            return {...s, sortings: s.sortings.map(x => (x.sortingId === a.unitMetricsForSorting.sortingId) ? {...x, unitMetricsUri: a.unitMetricsForSorting.metricsUri} : x)}
        case 'SET_SNIPPET_LEN':
            return {...s, snippetLen: a.snippetLen}
        default: return s
    }
}

export type WorkspaceDispatch = (a: WorkspaceAction) => void

const intersection = (a: number[], b: number[]) => (
    a.filter(x => (b.includes(x)))
)
const union = (a: number[], b: number[]) => (
    [...a, ...b.filter(x => (!a.includes(x)))].sort()
)

const simplifyMergeGroups = (mg: (number[])[]): (number[])[] => {
    const newMergeGroups = mg.map(g => [...g]) // make a copy
    let somethingChanged = true
    while (somethingChanged) {
        somethingChanged = false
        for (let i = 0; i < newMergeGroups.length; i ++) {
            const g1 = newMergeGroups[i]
            for (let j = i + 1; j < newMergeGroups.length; j ++) {
                const g2 = newMergeGroups[j]
                if (intersection(g1, g2).length > 0) {
                    newMergeGroups[i] = union(g1, g2)
                    newMergeGroups[j] = []
                    somethingChanged = true
                }
            }
        }
    }
    return newMergeGroups.filter(g => (g.length >= 2))
}

export default workspaceReducer