import React, { FunctionComponent, useMemo, useState } from 'react'
import { LockableSelectUnitsWidget } from '../SelectUnitsWidget'
import { useLocalSelectedUnitIds } from '../SelectUnitsWidget'
import { UnitsTableBottomToolbar, defaultUnitsTableBottomToolbarOptions, UnitsTableBottomToolbarOptions } from '../ViewToolbar'
import { SpikeLocationsViewData } from './SpikeLocationsViewData'
import SpikeLocationsWidget from './SpikeLocationsWidget'
import { Splitter } from '../../core-views'
import { computeElectrodesFromIdsAndLocations } from '../view-average-waveforms'

type Props = {
    data: SpikeLocationsViewData
    width: number
    height: number
}

const MAX_UNITS_SELECTED = 10

const SpikeLocationsView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds, currentUnitId, orderedUnitIds, visibleUnitIds, checkboxClickHandlerGenerator, unitIdSelectionDispatch, selectionLocked, toggleSelectionLocked} = useLocalSelectedUnitIds()

    const allUnitIds = useMemo(() => (
        data.units.map(u => (u.unitId))
    ), [data.units])

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={200}
        >
            {
                !data.hideUnitSelector && (
                    <LockableSelectUnitsWidget
                        unitIds={allUnitIds}
                        selectedUnitIds={selectedUnitIds}
                        currentUnitId={currentUnitId}
                        orderedUnitIds={orderedUnitIds}
                        visibleUnitIds={visibleUnitIds}
                        checkboxClickHandlerGenerator={checkboxClickHandlerGenerator}
                        unitIdSelectionDispatch={unitIdSelectionDispatch}
                        locked={selectionLocked}
                        toggleLockStateCallback={toggleSelectionLocked}
                    />
                )
            }
            {
                selectedUnitIds.size > MAX_UNITS_SELECTED ? (
                    <div>Not showing spike locations. Too many units selected (max = {MAX_UNITS_SELECTED}).</div>
                ) : (
                    <SpikeLocationsViewChild
                        data={data}
                        width={0} // filled in by splitter
                        height={0} // filled in by splitter
                        selectedUnitIds={selectedUnitIds}
                    />
                )
            }
        </Splitter>
    )
}

type ChildProps = {
    data: SpikeLocationsViewData
    selectedUnitIds: Set<number | string>
    width: number
    height: number
}

const SpikeLocationsViewChild: FunctionComponent<ChildProps> = (props: ChildProps) => {
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
                <SpikeLocationsWidget
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


export default SpikeLocationsView