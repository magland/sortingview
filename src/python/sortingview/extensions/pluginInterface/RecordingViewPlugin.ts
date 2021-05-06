import { CalculationPool } from "labbox";
import { LabboxViewPlugin } from ".";
import { Recording, RecordingInfo } from "./Recording";
import { RecordingSelection, RecordingSelectionDispatch } from "./RecordingSelection";

export interface RecordingViewProps {
    recording: Recording
    recordingInfo: RecordingInfo
    selection: RecordingSelection
    selectionDispatch: RecordingSelectionDispatch
    calculationPool: CalculationPool
    width?: number
    height?: number
}

export interface RecordingViewPlugin extends LabboxViewPlugin {
    type: 'RecordingView'
    component: React.ComponentType<RecordingViewProps>
    icon?: any
    notebookCellHeight?: number
}
