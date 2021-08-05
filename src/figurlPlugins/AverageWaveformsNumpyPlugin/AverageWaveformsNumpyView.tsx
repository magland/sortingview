import { IconButton } from '@material-ui/core';
import { Help } from '@material-ui/icons';
import { useVisible } from 'figurl/labbox-react';
import Splitter from 'figurl/labbox-react/components/Splitter/Splitter';
import { ActionItem, DividerItem } from 'python/sortingview/gui/extensions/common/Toolbars';
import ViewToolbar from 'python/sortingview/gui/extensions/common/ViewToolbar';
import { SortingSelection, SortingSelectionDispatch } from 'python/sortingview/gui/pluginInterface';
import React, { Fragment, FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import AverageWaveformNumpyView from './AverageWaveformNumpyView';
import { ElectrodeChannel, Waveform } from './AverageWaveformsNumpyPlugin';
import SortingUnitPlotGridNumpy from './SortingUnitPlotGridNumpy';

export type AverageWaveformAction = ActionItem  | DividerItem

type Props = {
    electrodeChannels: ElectrodeChannel[]
    waveforms: Waveform[]
    noiseLevel: number
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    width: number
    height: number
}

const TOOLBAR_INITIAL_WIDTH = 36 // hard-coded for now

const AverageWaveformsNumpyView: FunctionComponent<Props> = (props) => {
    const {electrodeChannels, waveforms, noiseLevel, selection, selectionDispatch, width, height} = props
    const boxHeight = 250
    const boxWidth = 180
    const [scalingActions, setScalingActions] = useState<AverageWaveformAction[] | null>(null)
    const unitComponent = useMemo(() => (unitId: number) => (
        <AverageWaveformNumpyView
            electrodeChannels={electrodeChannels}
            waveforms={waveforms}
            unitId={unitId}
            selection={selection}
            selectionDispatch={selectionDispatch}
            width={boxWidth}
            height={boxHeight}
            noiseLevel={noiseLevel}
            customActions={scalingActions || []}
        />
    ), [electrodeChannels, waveforms, selection, selectionDispatch, noiseLevel, scalingActions])

    const unitIds = useMemo(() => (
        waveforms.map(w => (w.unitId))
    ), [waveforms])

    const _handleScaleAmplitudeUp = useCallback(() => {
        selectionDispatch({type: 'ScaleAmpScaleFactor', direction: 'up'})
    }, [selectionDispatch])
    const _handleScaleAmplitudeDown = useCallback(() => {
        selectionDispatch({type: 'ScaleAmpScaleFactor', direction: 'down'})
    }, [selectionDispatch])

    useEffect(() => {
        const actions: AverageWaveformAction[] = [
            {
                type: 'button',
                callback: _handleScaleAmplitudeUp,
                title: 'Scale amplitude up [up arrow]',
                icon: <FaArrowUp />,
                keyCode: 38
            },
            {
                type: 'button',
                callback: _handleScaleAmplitudeDown,
                title: 'Scale amplitude down [down arrow]',
                icon: <FaArrowDown />,
                keyCode: 40
            }
        ]
        setScalingActions(actions)
    }, [_handleScaleAmplitudeUp, _handleScaleAmplitudeDown])

    const infoVisible = useVisible()

    return width ? (
        <div>
            <Splitter
                width={width}
                height={height}
                initialPosition={TOOLBAR_INITIAL_WIDTH}
                adjustable={false}
            >
                {
                    <ViewToolbar
                        width={TOOLBAR_INITIAL_WIDTH}
                        height={height}
                        customActions={scalingActions}
                    />
                }
                {
                    <Fragment>
                        <div>
                            <IconButton onClick={infoVisible.show}><Help /></IconButton>
                        </div>
                        <SortingUnitPlotGridNumpy
                            unitIds={unitIds}
                            selection={selection}
                            selectionDispatch={selectionDispatch}
                            unitComponent={unitComponent}
                            sortingSelector={''}
                        />
                        {/* <MarkdownDialog
                            visible={infoVisible.visible}
                            onClose={infoVisible.hide}
                            source={info}
                        /> */}
                    </Fragment>
                }
            </Splitter>
        </div>
    )
    : (<div>No width</div>);
}

export default AverageWaveformsNumpyView