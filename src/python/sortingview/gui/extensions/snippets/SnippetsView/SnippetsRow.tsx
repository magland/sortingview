import { GridList, GridListTile } from '@material-ui/core';
import { KacheryNode } from 'kachery-js';
import { ChannelName } from 'kachery-js/types/kacheryTypes';
import { runPureCalculationTaskAsync, useFetchCache } from 'kachery-react';
import useChannel from 'kachery-react/useChannel';
import useKacheryNode from 'kachery-react/useKacheryNode';
import React, { FunctionComponent, useMemo } from 'react';
import { applyMergesToUnit, Recording, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from "../../../pluginInterface";
import { getElectrodesAspectRatio } from '../../common/sharedCanvasLayers/setupElectrodes';
import SnippetBox from './SnippetBox';


type Props = {
    recording: Recording
    sorting: Sorting
    noiseLevel: number
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    curation: SortingCuration
    unitId: number
    height: number
}

export type Snippet = {
    timepoint: number
    index: number
    unitId: number
    waveform?: number[][]
}

// const calculationPool = createCalculationPool({maxSimultaneous: 6})

type InfoType = {
    sampling_frequency: number
    channel_ids: number[]
    channel_locations: number[][]
}

type InfoQuery = {
    type: 'info'
    recording: Recording
    sorting: Sorting
    unitId: number
}

type SnippetsQuery = {
    type: 'snippets'
    recording: Recording
    sorting: Sorting
    unitId: number
    timeRange: {min: number, max: number}
}

type QueryType = InfoQuery | SnippetsQuery

const getSnippetsInfo = async (args: {recording: Recording, sorting: Sorting, unitId: number | number[], kacheryNode: KacheryNode, channelName: ChannelName}): Promise<InfoType> => {
    const { recording, sorting, unitId, kacheryNode, channelName } = args
    const result = await runPureCalculationTaskAsync<{
        channel_ids: number[]
        channel_locations: number[][]
        sampling_frequency: number
    }>(
        kacheryNode,
        'get_sorting_unit_info.1',
        {
            recording_object: recording.recordingObject,
            sorting_object: sorting.sortingObject,
            unit_id: unitId
        },
        {
            channelName
        }
    )
    return {
        channel_ids: result.channel_ids,
        channel_locations: result.channel_locations,
        sampling_frequency: result.sampling_frequency
    }
}

const getSnippets = async (args: {recording: Recording, sorting: Sorting, unitId: number | number[], timeRange: {min: number, max: number}, kacheryNode: KacheryNode, channelName: ChannelName}): Promise<Snippet[]> => {
    const { recording, sorting, unitId, timeRange, kacheryNode, channelName } = args
    const result = await runPureCalculationTaskAsync<{
        channel_ids: number[]
        channel_locations: number[][]
        sampling_frequency: number
        snippets: Snippet[]
    }>(
        kacheryNode,
        'get_sorting_unit_snippets.1',
        {
            recording_object: recording.recordingObject,
            sorting_object: sorting.sortingObject,
            unit_id: unitId,
            time_range: timeRange,
            max_num_snippets: 1000
        },
        {
            channelName
        }
    )
    return result.snippets
}

const segmentSize = 30000 * 10
const createTimeSegments = (timeRange: {min: number, max: number} | null, opts: {maxNumSegments: number}) => {
    const ret = [] as {min: number, max: number}[]
    if (!timeRange) return ret
    const i1 = Math.floor(timeRange.min / segmentSize)
    const i2 = Math.ceil(timeRange.max / segmentSize)
    for (let i = i1; i <= Math.min(i2, i1 + opts.maxNumSegments -1); i++) {
        ret.push({min: i * segmentSize, max: (i+1) * segmentSize})
    }
    return ret
}

const useSnippets = (args: {recording: Recording, sorting: Sorting, curation: SortingCuration, visibleElectrodeIds: number[] | undefined, selection: SortingSelection, unitId: number, timeRange: {min: number, max: number} | null}) => {
    const kacheryNode = useKacheryNode()
    const {channelName} = useChannel()
    const { recording, sorting, selection, curation, visibleElectrodeIds, unitId, timeRange } = args
    const fetchFunction = useMemo(() => (
        async (query: QueryType) => {
            switch(query.type) {
                case 'info':
                    const uid1 = applyMergesToUnit(query.unitId, curation, selection.applyMerges)
                    return await getSnippetsInfo({recording: query.recording, sorting: query.sorting, unitId: uid1, kacheryNode, channelName})
                case 'snippets':
                    const uid2 = applyMergesToUnit(query.unitId, curation, selection.applyMerges)
                    return await getSnippets({recording: query.recording, sorting: query.sorting, unitId: uid2, timeRange: query.timeRange, kacheryNode, channelName})
            }
        }
    ), [kacheryNode, channelName, curation, selection.applyMerges])
    const data = useFetchCache<QueryType>(fetchFunction)
    return useMemo(() => {
        const infoQuery: InfoQuery = {type: 'info', recording, sorting, unitId}
        // const snippetsQuery: SnippetsQuery = {type: 'snippets', recording, sorting, unitId}
        const info = data.get(infoQuery) as InfoType | undefined
        const timeSegments: {min: number, max: number}[] = createTimeSegments(timeRange, {maxNumSegments: 6})
        const snippetsList: Snippet[] = timeSegments.map(timeSegment => {
            const snippetsQuery: SnippetsQuery = {
                type: 'snippets',
                recording,
                sorting,
                unitId,
                timeRange: timeSegment
            }
            return data.get(snippetsQuery)
        })
        .reduce((acc, val) => (val ? (acc.concat(val as Snippet)) : acc), [] as Snippet[]) // accumulate the snippets from the time segments
        const snippets = snippetsList.map(s => (
            filterSnippetVisibleElectrodes(s, info?.channel_ids, visibleElectrodeIds) // only show the visible electrodes
        ))
        const snippetsInRange = snippets ? (
            snippets.filter((s) => ((timeRange) && (timeRange.min <= s.timepoint) && (s.timepoint < timeRange.max)))
        ) : undefined
        return {
            info: info ? {
                ...info,
                channel_ids: info.channel_ids.filter((eid, ii) => ((!visibleElectrodeIds) || (visibleElectrodeIds.includes(info.channel_ids[ii])))),
                channel_locations: info.channel_locations.filter((loc, ii) => ((!visibleElectrodeIds) || (visibleElectrodeIds.includes(info.channel_ids[ii])))),
            } : undefined,
            snippets: snippetsInRange
        }
    }, [data, recording, sorting, timeRange, unitId, visibleElectrodeIds])
}

const filterSnippetVisibleElectrodes = (s: Snippet, electrodeIds: number[] | undefined, visibleElectrodeIds: number[] | undefined) => {
    if (!electrodeIds) return s
    if (!visibleElectrodeIds) return s
    return {
        ...s,
        waveform: s.waveform?.filter((x, i) => (visibleElectrodeIds.includes(electrodeIds[i])))
    }
}

const SnippetsRow: FunctionComponent<Props> = ({ recording, sorting, selection, selectionDispatch, curation, unitId, height, noiseLevel }) => {
    const {snippets, info} = useSnippets({recording, sorting, selection, curation, visibleElectrodeIds: selection.visibleElectrodeIds, unitId, timeRange: selection.timeRange || null})
    const electrodeLocations = info?.channel_locations
    const boxWidth = useMemo(() => {
        if (selection.waveformsMode === 'geom') {
            const boxAspect = (electrodeLocations ? getElectrodesAspectRatio(electrodeLocations) : 1) || 1
            return (boxAspect > 1 ? height / boxAspect : height * boxAspect)
        }
        else {
            return 100
        }
    }, [electrodeLocations, height, selection.waveformsMode])
    const tileStyle = useMemo(() => ({width: boxWidth + 5, height: height + 15}), [boxWidth, height])
    return (
        <GridList style={{flexWrap: 'nowrap', height: height + 15}}>
            {
                info && electrodeLocations && snippets ? (
                    snippets.length > 0 ? (
                        snippets.map((snippet) => (
                            <GridListTile key={snippet.timepoint} style={tileStyle}>
                                <SnippetBox
                                    snippet={snippet}
                                    noiseLevel={noiseLevel}
                                    samplingFrequency={info.sampling_frequency}
                                    electrodeIds={info.channel_ids}
                                    electrodeLocations={electrodeLocations}
                                    selection={selection}
                                    selectionDispatch={selectionDispatch}
                                    width={boxWidth}
                                    height={height}
                                />
                            </GridListTile>
                        ))
                    ) : (
                        <GridListTile style={{...tileStyle, width: 500, color: 'gray'}}>
                            <div>No snippets found in selected time range</div>
                        </GridListTile>
                    )
                ) : (
                    <GridListTile style={{...tileStyle, width: 180}}>
                        <div style={{whiteSpace: 'nowrap'}}>Retrieving snippets...</div>
                    </GridListTile>
                )
            }
        </GridList>
    )
}

export default SnippetsRow