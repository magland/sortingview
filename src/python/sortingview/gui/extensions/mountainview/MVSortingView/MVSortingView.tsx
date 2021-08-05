import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Settings, SquareFoot, Visibility } from '@material-ui/icons'
import GrainIcon from '@material-ui/icons/Grain'
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser'
import { JSONStringifyDeterministic } from 'kachery-js/types/kacheryTypes'
import { usePlugins } from 'figurl/labbox-react'
import Expandable from "figurl/labbox-react/components/Expandable/Expandable"
import Splitter from 'figurl/labbox-react/components/Splitter/Splitter'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { LabboxPlugin, SortingComparisonViewPlugin, SortingUnitViewPlugin, SortingViewPlugin, sortingViewPlugins, SortingViewProps } from "../../../pluginInterface"
import { RecordingViewPlugin } from '../../../pluginInterface/RecordingViewPlugin'
import '../mountainview.css'
import CurationControl from './CurationControl'
import MetricsControl from './MetricsControl'
import OptionsControl from './OptionsControl'
import PreloadCheck from './PreloadCheck'
import ViewContainer from './ViewContainer'
import ViewLauncher from './ViewLauncher'
import ViewWidget from './ViewWidget'
import VisibleElectrodesControl from './VisibleElectrodesControl'
import VisibleUnitsControl from './VisibleUnitsControl'

const initialLeftPanelWidth = 320

type ViewPlugin = SortingViewPlugin | RecordingViewPlugin | SortingUnitViewPlugin | SortingComparisonViewPlugin

type AddViewAction = {
    type: 'AddView'
    plugin: ViewPlugin
    label: string
    area: 'north' | 'south' | ''
    extraProps?: {[key: string]: any}
}

type CloseViewAction = {
    type: 'CloseView'
    view: View
}

type SetViewAreaAction = {
    type: 'SetViewArea'
    viewId: string
    area: 'north' | 'south'
}

export class View {
    activate: boolean = false // signal to set this tab as active
    area: 'north' | 'south' | '' = ''
    constructor(public plugin: ViewPlugin, public extraProps: {[key: string]: any}, public label: string, public viewId: string) {

    }

}

type OpenViewsAction = AddViewAction | CloseViewAction | SetViewAreaAction

let lastViewIdNum: number = 0
export const openViewsReducer: React.Reducer<View[], OpenViewsAction> = (state: View[], action: OpenViewsAction): View[] => {
    if (action.type === 'AddView') {
        const plugin = action.plugin
        if (plugin.singleton) {
            for (let v0 of state) {
                if ((v0.plugin.name === plugin.name) && (JSONStringifyDeterministic(v0.extraProps || {}) === (JSONStringifyDeterministic(action.extraProps || {})))) {
                    v0.activate = true
                    return [...state]
                }
            }
        }
        lastViewIdNum ++
        const v = new View(plugin, action.extraProps || {}, action.label, lastViewIdNum + '')
        v.activate = true // signal to set this as active
        v.area = action.area
        return [...state, v].sort((a, b) => (a.plugin.label > b.plugin.label ? 1 : a.plugin.label < b.plugin.label ? -1 : 0))
    }
    else if (action.type === 'CloseView') {
        return state.filter(v => (v !== action.view))
    }
    else if (action.type === 'SetViewArea') {
        return state.map(v => (v.viewId === action.viewId ? {...v, area: action.area, activate: true} : v))
    }
    else return state
}

const MVSortingViewWithCheck: FunctionComponent<SortingViewProps> = (props) => {
    const {recording, sorting} = props

    // const [preprocessingSelection, preprocessingSelectionDispatch] = useReducer(preprocessingSelectionReducer, {filterType: 'none'})

    // const preprocessedRecording = useMemo(() => {
    //     if (!recording) return recording
    //     if (preprocessingSelection.filterType === 'none') {
    //         return recording
    //     }
    //     else if (preprocessingSelection.filterType === 'bandpass_filter') {
    //         return {
    //             ...recording,
    //             recordingObject: {
    //                 recording_format: 'filtered',
    //                 data: {
    //                     filters: [{type: 'bandpass_filter', freq_min: 300, freq_max: 3000, freq_wid: 1000}],
    //                     recording: recording.recordingObject
    //                 }
    //             }
    //         }
    //     }
    //     else {
    //         throw Error(`Unexpected filter type: ${preprocessingSelection.filterType}`)
    //     }
    // }, [recording, preprocessingSelection])

    const preprocessedRecording = recording

    return (
        <PreloadCheck recording={preprocessedRecording} sorting={sorting} width={props.width || 0} height={props.height || 0}>
            <MVSortingView
                {...props}
                // {...{preprocessingSelection, preprocessingSelectionDispatch}}
                recording={preprocessedRecording}
            />
        </PreloadCheck>
    )
}

// interface PreprocessingProps {
//     preprocessingSelection: PreprocessingSelection
//     preprocessingSelectionDispatch: (a: PreprocessingSelectionAction) => void
// }

const MVSortingView: FunctionComponent<SortingViewProps & {preloadStatus?: 'waiting' | 'running' | 'finished'}/* & PreprocessingProps*/> = (props) => {
    // useCheckForChanges('MVSortingView', props)
    const {recording, sorting, recordingInfo, selection, selectionDispatch, curation, preloadStatus, curationDispatch, workspaceUri} = props
    const [openViews, openViewsDispatch] = useReducer(openViewsReducer, [])
    const [initializedViews, setInitializedViews] = useState(false)

    const plugins = usePlugins<LabboxPlugin>()
    const UnitsTablePlugin = sortingViewPlugins(plugins).filter(p => (p.name === 'UnitsTable'))[0]
    const AverageWaveformsPlugin = sortingViewPlugins(plugins).filter(p => (p.name === 'AverageWaveforms'))[0]

    const initialPluginViews: {plugin: SortingViewPlugin | undefined, area: 'north' | 'south'}[] = useMemo(() => ([
        {plugin: UnitsTablePlugin, area: 'north' as 'north' | 'south'},
        {plugin: AverageWaveformsPlugin, area: 'south' as 'north' | 'south'}
    ]).filter(x => (x.plugin !== undefined)), [UnitsTablePlugin, AverageWaveformsPlugin])
    // const electrodeGeometryPlugin = plugins.sortingViews.ElectrodeGeometrySortingView
    useEffect(() => {
        if ((preloadStatus === 'finished') && (openViews.length === 0) && (!initializedViews)) {
            setInitializedViews(true)
            initialPluginViews.forEach(x => {
                // openViewsDispatch({
                //     type: 'AddView',
                //     plugin: x.plugin,
                //     pluginType: 'SortingView',
                //     label: x.plugin.label,
                //     area: x.area
                // })
            })
        }
    }, [preloadStatus, initializedViews, initialPluginViews, openViews.length])
    const handleLaunchSortingView = useCallback((plugin: SortingViewPlugin) => {
        openViewsDispatch({
            type: 'AddView',
            plugin,
            label: plugin.label,
            area: ''
        })
    }, [openViewsDispatch])
    const handleLaunchRecordingView = useCallback((plugin: RecordingViewPlugin) => {
        openViewsDispatch({
            type: 'AddView',
            plugin,
            label: plugin.label,
            area: ''
        })
    }, [openViewsDispatch])
    const handleLaunchSortingUnitView = useCallback((plugin: SortingUnitViewPlugin, unitId: number, label: string) => {
        openViewsDispatch({
            type: 'AddView',
            plugin,
            label,
            area: '',
            extraProps: {unitId}
        })
    }, [openViewsDispatch])
    const handleViewClosed = useCallback((v: View) => {
        openViewsDispatch({
            type: 'CloseView',
            view: v
        })
    }, [openViewsDispatch])
    const handleSetViewArea = useCallback((view: View, area: 'north' | 'south') => {
        openViewsDispatch({
            type: 'SetViewArea',
            viewId: view.viewId,
            area
        })
    }, [openViewsDispatch])
    const width = props.width || 600
    const height = props.height || 900
    // const preprocessingIcon = <span style={{color: 'gray'}}><GraphicEq /></span>
    const visibleUnitsIcon = <span style={{color: 'gray'}}><Visibility /></span>
    const visibleElectrodesIcon = <span style={{color: 'gray'}}><GrainIcon /></span>
    const launchIcon = <span style={{color: 'gray'}}><OpenInBrowserIcon /></span>
    const curationIcon = <span style={{color: 'gray'}}><FontAwesomeIcon icon={faPencilAlt} /></span>
    const optionsIcon = <span style={{color: 'gray'}}><Settings /></span>
    const metricsIcon = <span style={{color: 'gray'}}><SquareFoot /></span>

    const hasSorting = sorting.sortingObject ? true : false

    const sortingViewProps = {...props}
    return (
        
        <div className="MVSortingView">
            <Splitter
                width={width}
                height={height}
                initialPosition={initialLeftPanelWidth}
            >
                <div>
                    {/* Launch */}
                    <Expandable icon={launchIcon} label="Open views" defaultExpanded={true} unmountOnExit={false}>
                        <ViewLauncher
                            onLaunchSortingView={handleLaunchSortingView}
                            onLaunchRecordingView={handleLaunchRecordingView}
                            onLaunchSortingUnitView={handleLaunchSortingUnitView}
                            selection={props.selection}
                            hasSorting={hasSorting}
                        />
                    </Expandable>

                    {/* Visible units */}
                    {
                        hasSorting && (
                            <Expandable icon={visibleUnitsIcon} label="Visible units" defaultExpanded={false} unmountOnExit={false}>
                                <VisibleUnitsControl sorting={sorting} recording={recording} selection={selection} selectionDispatch={selectionDispatch} curation={curation} />
                            </Expandable>
                        )
                    }

                    {/* Visible electrodes */}
                    <Expandable icon={visibleElectrodesIcon} label="Visible electrodes" defaultExpanded={false} unmountOnExit={false}>
                        <VisibleElectrodesControl recordingInfo={recordingInfo} selection={selection} selectionDispatch={selectionDispatch} />
                    </Expandable>

                    {/* Preprocessing */}
                    {/* <Expandable icon={preprocessingIcon} label="Preprocessing" defaultExpanded={false} unmountOnExit={false}>
                        <PreprocessingControl
                            preprocessingSelection={preprocessingSelection}
                            preprocessingSelectionDispatch={preprocessingSelectionDispatch}
                        />
                    </Expandable> */}
                    
                    {/* Curation */}
                    { curationDispatch && hasSorting && (
                        <Expandable icon={curationIcon} label="Curation" defaultExpanded={false} unmountOnExit={false}>
                                
                            <CurationControl
                                sortingId={sorting.sortingId}
                                curation={props.curation || {}}
                                curationDispatch={curationDispatch}
                                selection={props.selection}
                                selectionDispatch={props.selectionDispatch}
                            />
                        </Expandable>
                    )}

                    {/* Metrics */}
                    <Expandable icon={metricsIcon} label="Metrics" defaultExpanded={false} unmountOnExit={false}>
                        <MetricsControl workspaceUri={workspaceUri} sortingId={sorting.sortingId} />
                    </Expandable>

                    {/* Options */}
                    <Expandable icon={optionsIcon} label="Options" defaultExpanded={false} unmountOnExit={false}>
                        <OptionsControl selection={selection} selectionDispatch={selectionDispatch} />
                    </Expandable>
                </div>
                <ViewContainer
                    onViewClosed={handleViewClosed}
                    onSetViewArea={handleSetViewArea}
                    views={openViews}
                    width={0} // will be replaced by splitter
                    height={0} // will be replaced by splitter
                >
                    {
                        openViews.map(v => (
                            <ViewWidget
                                key={v.viewId}
                                view={v}
                                sortingViewProps={sortingViewProps}
                            />
                        ))
                    }
                </ViewContainer>
            </Splitter>
        </div>
    )
}

export default MVSortingViewWithCheck
