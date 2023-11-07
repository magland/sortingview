import React, { FunctionComponent } from 'react'
import {computeElectrodesFromIdsAndLocations, ElectrodeGeometry} from '../view-average-waveforms'
import { ElectrodeGeometryViewData } from './ElectrodeGeometryViewData'

type ElectrodeGeometryViewProps = {
    data: ElectrodeGeometryViewData
    width: number
    height: number
}

const ElectrodeGeometryView: FunctionComponent<ElectrodeGeometryViewProps> = (props: ElectrodeGeometryViewProps) => {
    const { data, width, height } = props
    const channelIds = Object.keys(data.channelLocations).map(id => parseInt(id))
    const electrodes = computeElectrodesFromIdsAndLocations(channelIds, data.channelLocations)

    return (
        <ElectrodeGeometry
            width={width}
            height={height}
            electrodes={electrodes}
        />
    )
}


export default ElectrodeGeometryView