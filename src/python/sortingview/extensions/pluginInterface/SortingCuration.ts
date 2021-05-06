export type SortingCuration = {
    labelsByUnit?: {[key: string]: string[]}
    labelChoices?: string[]
    mergeGroups?: (number[])[]
}

export interface AddUnitLabelCurationAction {
    type: 'ADD_UNIT_LABEL'
    unitId: number
    label: string
}

export interface RemoveUnitLabelCurationAction {
    type: 'REMOVE_UNIT_LABEL'
    unitId: number
    label: string
}

export interface MergeUnitsCurationAction {
    type: 'MERGE_UNITS'
    unitIds: number[]
}

export interface UnmergeUnitsCurationAction {
    type: 'UNMERGE_UNITS'
    unitIds: number[]
}

export interface SetCurationCurationAction {
    type: 'SET_CURATION'
    curation: SortingCuration
}

export type SortingCurationAction = AddUnitLabelCurationAction | RemoveUnitLabelCurationAction | MergeUnitsCurationAction | UnmergeUnitsCurationAction | SetCurationCurationAction

export type SortingCurationDispatch = (action: SortingCurationAction) => void

export const mergeGroupForUnitId = (unitId: number, curation: SortingCuration | undefined) => {
    const mergeGroups = (curation || {}).mergeGroups || []
    return mergeGroups.filter(g => (g.includes(unitId)))[0] || null
}

export const applyMergesToUnit = (unitId: number, curation: SortingCuration | undefined, applyMerges: boolean | undefined) => {
    return applyMerges ? (
        mergeGroupForUnitId(unitId, curation) || unitId
    ) : unitId
}

export const isMergeGroupRepresentative = (unitId: number, curation: SortingCuration | undefined) => {
    const mg = mergeGroupForUnitId(unitId, curation)
    if (!mg) return true
    return (Math.min(...mg) === unitId)
}