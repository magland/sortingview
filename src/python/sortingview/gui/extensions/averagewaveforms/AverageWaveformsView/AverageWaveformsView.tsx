import { IconButton } from '@material-ui/core'
import { Help } from '@material-ui/icons'
import { useVisible } from 'labbox-react'
import MarkdownDialog from 'labbox-react/components/Markdown/MarkdownDialog'
import Splitter from 'labbox-react/components/Splitter/Splitter'
import { useRecordingInfo } from 'python/sortingview/gui/pluginInterface/useRecordingInfo'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'
import SortingUnitPlotGrid from '../../../commonComponents/SortingUnitPlotGrid/SortingUnitPlotGrid'
import info from '../../../helpPages/AverageWaveforms.md.gen'
import { SortingViewProps } from '../../../pluginInterface'
import { ActionItem, DividerItem } from '../../common/Toolbars'
import ViewToolbar from '../../common/ViewToolbar'
import AverageWaveformView from './AverageWaveformView'


export type AverageWaveformAction = ActionItem  | DividerItem

const TOOLBAR_INITIAL_WIDTH = 36 // hard-coded for now

const AverageWaveformsView: FunctionComponent<SortingViewProps> = (props) => {
    const {recording, sorting, curation, selection, selectionDispatch, width=600, height=650, snippetLen, sortingSelector} = props
    const recordingInfo = useRecordingInfo(recording.recordingPath)
    const boxHeight = 250
    const boxWidth = 180
    const noiseLevel = (recordingInfo || {}).noise_level || 1  // fix this
    const [scalingActions, setScalingActions] = useState<AverageWaveformAction[] | null>(null)

    const visibleElectrodeIds = useMemo(() => (selection.visibleElectrodeIds), [selection.visibleElectrodeIds])
    const selectedElectrodeIds = useMemo(() => (selection.selectedElectrodeIds || []), [selection.selectedElectrodeIds])
    const ampScaleFactor = useMemo(() => (selection.ampScaleFactor || 1), [selection.ampScaleFactor])
    const applyMerges = useMemo(() => (selection.applyMerges || false), [selection.applyMerges])
    const waveformsMode = useMemo(() => (selection.waveformsMode || 'geom'), [selection.waveformsMode])

    const unitComponent = useMemo(() => (unitId: number) => (
            <AverageWaveformView
                {...{sorting, curation, recording, unitId, selectionDispatch}}
                selectionDispatch={selectionDispatch}
                width={boxWidth}
                height={boxHeight}
                noiseLevel={noiseLevel}
                customActions={scalingActions || []}
                snippetLen={snippetLen}
                visibleElectrodeIds={visibleElectrodeIds}
                selectedElectrodeIds={selectedElectrodeIds}
                ampScaleFactor={ampScaleFactor}
                applyMerges={applyMerges}
                waveformsMode={waveformsMode}
            />
    ), [sorting, recording, selectionDispatch, noiseLevel, scalingActions, curation, snippetLen, visibleElectrodeIds, selectedElectrodeIds, ampScaleFactor, applyMerges, waveformsMode])

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
                    <div>
                        <div>
                            <IconButton onClick={infoVisible.show}><Help /></IconButton>
                        </div>
                        <SortingUnitPlotGrid
                            sorting={sorting}
                            selection={selection}
                            curation={curation}
                            selectionDispatch={selectionDispatch}
                            unitComponent={unitComponent}
                            sortingSelector={sortingSelector}
                        />
                        <MarkdownDialog
                            visible={infoVisible.visible}
                            onClose={infoVisible.hide}
                            source={info}
                        />
                    </div>
                }
            </Splitter>
        </div>
    )
    : (<div>No width</div>);
}

export default AverageWaveformsView