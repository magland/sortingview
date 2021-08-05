import { CalculationPool } from "figurl/kachery-react/createCalculationPool";
import { LabboxViewPlugin } from ".";
import { Recording, RecordingInfo } from "./Recording";
import { Sorting, SortingInfo } from "./Sorting";
import { SortingCuration, SortingCurationAction } from './SortingCuration';
import { SortingSelection, SortingSelectionAction } from "./SortingSelection";

export interface SortingComparisonViewProps {
    sorting1: Sorting
    sorting2: Sorting
    recording: Recording
    sortingInfo1: SortingInfo
    sortingInfo2: SortingInfo
    recordingInfo: RecordingInfo
    curation1: SortingCuration
    curation2: SortingCuration
    curation1Dispatch: ((action: SortingCurationAction) => void) | undefined
    curation2Dispatch: ((action: SortingCurationAction) => void) | undefined
    selection1: SortingSelection
    selection2: SortingSelection
    selection1Dispatch: (a: SortingSelectionAction) => void
    selection2Dispatch: (a: SortingSelectionAction) => void
    readOnly: boolean | null
    calculationPool?: CalculationPool
    width: number
    height: number
    snippetLen?: [number, number]
    workspaceUri?: string
}

export interface SortingComparisonViewPlugin extends LabboxViewPlugin {
    type: 'SortingComparisonView'
    name: string
    label: string
    component: React.ComponentType<SortingComparisonViewProps>
    notebookCellHeight?: number
    icon?: any
}