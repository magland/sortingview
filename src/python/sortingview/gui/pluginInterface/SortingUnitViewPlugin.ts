import { LabboxViewPlugin } from ".";
import { SortingViewProps } from "./SortingViewPlugin";

export interface SortingUnitViewProps extends SortingViewProps {
    unitId: number
    selectedSpikeIndex: number | null
    onSelectedSpikeIndexChanged?: (index: number | null) => void
}

export interface SortingUnitViewPlugin extends LabboxViewPlugin {
    type: 'SortingUnitView'
    component: React.ComponentType<SortingUnitViewProps>
    icon?: any
}
