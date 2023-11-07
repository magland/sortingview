import { computeElectrodesFromIdsAndLocations } from '../view-average-waveforms'
import { defaultUnitsTableBottomToolbarOptions, UnitsTableBottomToolbar, UnitsTableBottomToolbarOptions } from '../ViewToolbar'
import React, { FunctionComponent, useMemo, useState } from 'react'
import { UnitLocationsViewData } from './UnitLocationsViewData'
import UnitLocationsWidget from './UnitLocationsWidget'

type UnitLocationsViewProps = {
    data: UnitLocationsViewData
    width: number
    height: number
}

const UnitLocationsView: FunctionComponent<UnitLocationsViewProps> = (props: UnitLocationsViewProps) => {
    const { data, width, height } = props

    const [toolbarOptions, setToolbarOptions] = useState<UnitsTableBottomToolbarOptions>(
        {...defaultUnitsTableBottomToolbarOptions, onlyShowSelected: false}
    )
    const bottomToolbarHeight = 30

    const channelIds = Object.keys(data.channelLocations)
    const electrodes = computeElectrodesFromIdsAndLocations(channelIds, data.channelLocations)

    const divStyle: React.CSSProperties = useMemo(() => ({
        width: width - 20, // leave room for the scrollbar
        height: height - bottomToolbarHeight,
        top: 0,
        position: 'absolute'
    }), [width, height])

    return (
        <div>
            <div style={divStyle}>
                <UnitLocationsWidget
                    width={width - 20}
                    height={height - bottomToolbarHeight}
                    electrodes={electrodes}
                    units={data.units}
                    disableAutoRotate={data.disableAutoRotate}
                    onlyShowSelected={toolbarOptions.onlyShowSelected}
                />
            </div>
            <div style={{position: 'absolute', top: height - bottomToolbarHeight, height: bottomToolbarHeight, overflow: 'hidden'}}>
                <UnitsTableBottomToolbar
                    options={toolbarOptions}
                    setOptions={setToolbarOptions}
                />
            </div>
        </div>
    )
}


export default UnitLocationsView