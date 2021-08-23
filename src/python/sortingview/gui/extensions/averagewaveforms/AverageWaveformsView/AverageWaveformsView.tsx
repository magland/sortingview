import { IconButton } from '@material-ui/core'
import { Help } from '@material-ui/icons'
import { TaskKwargs } from "kachery-js/types/kacheryTypes"
// import { applyMergesToUnit, Recording, Sorting, SortingCuration, SortingSelectionDispatch } from '../../../pluginInterface'
import initiateTask, { Task } from "kachery-react/initiateTask"
import useChannel from 'kachery-react/useChannel'
import useKacheryNode from "kachery-react/useKacheryNode"
import { useVisible } from 'labbox-react'
import MarkdownDialog from 'labbox-react/components/Markdown/MarkdownDialog'
import Splitter from 'labbox-react/components/Splitter/Splitter'
import { useRecordingInfo } from 'python/sortingview/gui/pluginInterface/useRecordingInfo'
import React, { Fragment, FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'
import SortingUnitPlotGrid from '../../../commonComponents/SortingUnitPlotGrid/SortingUnitPlotGrid'
import info from '../../../helpPages/AverageWaveforms.md.gen'
import { applyMergesToUnit, SortingViewProps } from '../../../pluginInterface'
import { useSortingInfo } from '../../../pluginInterface/useSortingInfo'
import { ActionItem, DividerItem } from '../../common/Toolbars'
import ViewToolbar from '../../common/ViewToolbar'
import AverageWaveformView from './AverageWaveformView'



export type AverageWaveformAction = ActionItem  | DividerItem

export type PlotData = {
    average_waveform: number[][]
    channel_ids: number[]
    channel_locations: number[][]
    sampling_frequency: number
}

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

    const sortingInfo = useSortingInfo(sorting.sortingPath)
    const unitIds: (number)[] = useMemo(() => sortingInfo ? sortingInfo.unit_ids : [], [sortingInfo])
    // TODO: Apply merges here --> applyMergesToUnit(id, curation, applyMerges)
    const {channelName} = useChannel()
    const kacheryNode = useKacheryNode()

    // The following useEffect() contents are copied from src/kachery-react/useTask.ts.
    // Cutting and pasting this is really not ideal, but we can't call a hook in a map, so we have to map in the hook.
    // I think really what we need is a useTasks() hook that can call initiateTask over an array...
    // THEN we can memoize THAT, dependent on the array... but let's implement it by cut-and-paste here first to see if it
    // even solves the refreshing problem.
    const [plotDataTasks, setPlotDataTasks] = useState<{[key: number]: Task<PlotData>}>({})
    const [, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => { setUpdateCode(c => (c+1)) }, [])
    const baseKwArgs = useMemo(() => 
        {
            return ({ 
                sorting_object: sorting.sortingObject,
                recording_object: recording.recordingObject,
                snippet_len: snippetLen
            } as any as TaskKwargs)
        }, [sorting.sortingObject, recording.recordingObject, snippetLen])

    useEffect(() => {
        let mergedUnitIds: {[key: number]: number | number[]} = {}
        unitIds.forEach((id) => mergedUnitIds[id] = applyMergesToUnit(id, curation, applyMerges))

        let valid = true

        const onStatusChanged = () => {
            if (!valid) return
            incrementUpdateCode()
        }

        const taskList = unitIds.map((unitId) => {
            return initiateTask<PlotData>({
                kacheryNode,
                channelName: channelName,
                functionId: 'fetch_average_waveform.2',
                kwargs: {...baseKwArgs, unit_id: mergedUnitIds[unitId]},
                functionType: 'pure-calculation',
                onStatusChanged: onStatusChanged,
                queryUseCache: false,
                queryFallbackToCache: false
            }) as any as Task<PlotData>
        })

        let taskMap: {[key: number]: Task<PlotData>} = {}
        taskList.forEach((task) => {
            if (visibleElectrodeIds && task && task.status === 'finished') {
                if (!task.result) return
                task.result.channel_ids = task.result.channel_ids.filter(id => visibleElectrodeIds.includes(id))
                const cids = task.result.channel_ids || [] // keeps the linter happy
                task.result.channel_locations = task.result.channel_locations.filter((loc, ii) => (visibleElectrodeIds.includes(cids[ii])))
            }
        })
        taskList.forEach((task, index) => taskMap[unitIds[index]] = task)

        setPlotDataTasks(taskMap)

        return () => { valid = false }
    }, [kacheryNode, channelName, baseKwArgs, incrementUpdateCode, unitIds, applyMerges, curation, visibleElectrodeIds])

    // I can already see that this is going to produce a veritable DELUGE of updates...

    // TODO: let's further pre-process the plot data to pass in channels/channel locations that are already filtered...

    const unitComponent = useMemo(() => (unitId: number) => (
            <AverageWaveformView
                plotDataTask={plotDataTasks[unitId]}
                selectionDispatch={selectionDispatch}
                width={boxWidth}
                height={boxHeight}
                noiseLevel={noiseLevel}
                customActions={scalingActions || []}
                selectedElectrodeIds={selectedElectrodeIds}
                ampScaleFactor={ampScaleFactor}
                waveformsMode={waveformsMode}
            />
    ), [plotDataTasks, selectionDispatch, noiseLevel, scalingActions, selectedElectrodeIds, ampScaleFactor, waveformsMode])

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
                    </Fragment>
                }
            </Splitter>
        </div>
    )
    : (<div>No width</div>);
}

export default AverageWaveformsView