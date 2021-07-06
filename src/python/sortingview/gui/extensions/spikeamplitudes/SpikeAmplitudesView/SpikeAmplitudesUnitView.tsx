import { SortingUnitViewProps } from 'python/sortingview/gui/pluginInterface'
import React, { FunctionComponent } from 'react'
import SpikeAmplitudesTimeWidget from './SpikeAmplitudesTimeWidget'
import useSpikeAmplitudesData from './useSpikeAmplitudesData'

const SpikeAmplitudesUnitView: FunctionComponent<SortingUnitViewProps> = (props) => {
    const spikeAmplitudesData = useSpikeAmplitudesData(props.recording.recordingObject, props.sorting.sortingObject, props.snippetsLen)
    if (!spikeAmplitudesData) {
        return <div>Creating spike amplitudes data...</div>
    }
    return (
        <SpikeAmplitudesTimeWidget
            spikeAmplitudesData={spikeAmplitudesData}
            recording={props.recording}
            sorting={props.sorting}
            unitIds={[props.unitId]}
            {...{width: props.width || 500, height: props.height || 500}}
            selection={props.selection}
            selectionDispatch={props.selectionDispatch}
            curation={props.curation}
        />
    )
}

export default SpikeAmplitudesUnitView