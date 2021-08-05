import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Settings, SquareFoot, Visibility } from '@material-ui/icons'
import GrainIcon from '@material-ui/icons/Grain'
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser'
import { usePlugins } from 'figurl/labbox-react'
import Expandable from "figurl/labbox-react/components/Expandable/Expandable"
import Splitter from 'figurl/labbox-react/components/Splitter/Splitter'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { LabboxPlugin, SortingComparisonViewPlugin, SortingComparisonViewProps, SortingUnitViewPlugin, SortingViewPlugin, sortingViewPlugins } from "../../../pluginInterface"
import { RecordingViewPlugin } from '../../../pluginInterface/RecordingViewPlugin'
import '../mountainview.css'
import CurationControl from '../MVSortingView/CurationControl'
import MetricsControl from '../MVSortingView/MetricsControl'
import { openViewsReducer, View } from '../MVSortingView/MVSortingView'
import OptionsControl from '../MVSortingView/OptionsControl'
import PreloadCheck from '../MVSortingView/PreloadCheck'
import ViewContainer from '../MVSortingView/ViewContainer'
import ViewLauncher from '../MVSortingView/ViewLauncher'
import VisibleElectrodesControl from '../MVSortingView/VisibleElectrodesControl'
import VisibleUnitsControl from '../MVSortingView/VisibleUnitsControl'
import ComparisonViewLauncher from './ComparisonViewLauncher'
import ComparisonViewWidget from './ComparisonViewWidget'

const initialLeftPanelWidth = 320

const MVSortingComparisonViewWithCheck: FunctionComponent<SortingComparisonViewProps> = (props) => {
    const {recording, sorting1, sorting2} = props

    return (
        <PreloadCheck recording={recording} sorting={sorting1} width={props.width || 0} height={props.height || 0}>
            <PreloadCheck recording={recording} sorting={sorting2} width={props.width || 0} height={props.height || 0}>
                <MVSortingComparisonView
                    {...props}
                    recording={recording}
                />
            </PreloadCheck>
        </PreloadCheck>
    )
}

const MVSortingComparisonView: FunctionComponent<SortingComparisonViewProps & {preloadStatus?: 'waiting' | 'running' | 'finished'}/* & PreprocessingProps*/> = (props) => {
    const {recording, sorting1, recordingInfo, selection1, selection1Dispatch, curation1, preloadStatus, curation1Dispatch, workspaceUri} = props
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
    const handleLaunchSortingView = useCallback((plugin: SortingViewPlugin, sortingSelector: string) => {
        openViewsDispatch({
            type: 'AddView',
            plugin,
            label: `${sortingSelector}: ${plugin.label}`,
            extraProps: {sortingSelector},
            area: ''
        })
    }, [openViewsDispatch])
    const handleLaunchSortingViewA = useCallback((plugin: SortingViewPlugin) => {
        handleLaunchSortingView(plugin, 'A')
    }, [handleLaunchSortingView])
    const handleLaunchSortingViewB = useCallback((plugin: SortingViewPlugin) => {
        handleLaunchSortingView(plugin, 'B')
    }, [handleLaunchSortingView])
    const handleLaunchRecordingView = useCallback((plugin: RecordingViewPlugin) => {
        openViewsDispatch({
            type: 'AddView',
            plugin,
            label: plugin.label,
            area: '',
            extraProps: {}
        })
    }, [openViewsDispatch])
    const handleLaunchSortingUnitView = useCallback((plugin: SortingUnitViewPlugin, unitId: number, label: string, sortingSelector: string) => {
        openViewsDispatch({
            type: 'AddView',
            plugin,
            label: `${sortingSelector}: ${label}`,
            area: '',
            extraProps: {unitId, sortingSelector}
        })
    }, [openViewsDispatch])
    const handleLaunchSortingUnitViewA = useCallback((plugin: SortingUnitViewPlugin, unitId: number, label: string) => {
        handleLaunchSortingUnitView(plugin, unitId, label, 'A')
    }, [handleLaunchSortingUnitView])
    const handleLaunchSortingUnitViewB = useCallback((plugin: SortingUnitViewPlugin, unitId: number, label: string) => {
        handleLaunchSortingUnitView(plugin, unitId, label, 'B')
    }, [handleLaunchSortingUnitView])
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
    const handleLaunchSortingComparisonView = useCallback((plugin: SortingComparisonViewPlugin) => {
        openViewsDispatch({
            type: 'AddView',
            plugin,
            label: plugin.label,
            extraProps: {},
            area: ''
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

    const sortingComparisonViewProps = {...props}
    return (
        
        <div className="MVSortingComparisonView MVSortingView">
            <Splitter
                width={width}
                height={height}
                initialPosition={initialLeftPanelWidth}
            >
                <div>
                    {/* Launch */}
                    <Expandable icon={launchIcon} label="Open views A" defaultExpanded={true} unmountOnExit={false}>
                        <ViewLauncher
                            onLaunchSortingView={handleLaunchSortingViewA}
                            onLaunchRecordingView={handleLaunchRecordingView}
                            onLaunchSortingUnitView={handleLaunchSortingUnitViewA}
                            selection={props.selection1}
                            hasSorting={true}
                            sortingSelector="A"
                        />
                    </Expandable>
                    <Expandable icon={launchIcon} label="Open views B" defaultExpanded={true} unmountOnExit={false}>
                        <ViewLauncher
                            onLaunchSortingView={handleLaunchSortingViewB}
                            onLaunchRecordingView={handleLaunchRecordingView}
                            onLaunchSortingUnitView={handleLaunchSortingUnitViewB}
                            selection={props.selection2}
                            hasSorting={true}
                            sortingSelector="B"
                        />
                    </Expandable>
                    <Expandable icon={launchIcon} label="Open comparison views" defaultExpanded={true} unmountOnExit={false}>
                        <ComparisonViewLauncher
                            onLaunchSortingComparisonView={handleLaunchSortingComparisonView}
                            selection1={props.selection1}
                            selection2={props.selection2}
                        />
                    </Expandable>

                    {/* Visible units */}
                    <Expandable icon={visibleUnitsIcon} label="Visible units" defaultExpanded={false} unmountOnExit={false}>
                        <VisibleUnitsControl sorting={sorting1} recording={recording} selection={selection1} selectionDispatch={selection1Dispatch} curation={curation1} />
                    </Expandable>

                    {/* Visible electrodes */}
                    <Expandable icon={visibleElectrodesIcon} label="Visible electrodes" defaultExpanded={false} unmountOnExit={false}>
                        <VisibleElectrodesControl recordingInfo={recordingInfo} selection={selection1} selectionDispatch={selection1Dispatch} />
                    </Expandable>
                    
                    {/* Curation */}
                    { curation1Dispatch && (
                        <Expandable icon={curationIcon} label="Curation" defaultExpanded={false} unmountOnExit={false}>
                                
                            <CurationControl
                                sortingId={sorting1.sortingId}
                                curation={props.curation1 || {}}
                                curationDispatch={curation1Dispatch}
                                selection={props.selection1}
                                selectionDispatch={props.selection1Dispatch}
                            />
                        </Expandable>
                    )}

                    {/* Metrics */}
                    <Expandable icon={metricsIcon} label="Metrics" defaultExpanded={false} unmountOnExit={false}>
                        <MetricsControl workspaceUri={workspaceUri} sortingId={sorting1.sortingId} />
                    </Expandable>

                    {/* Options */}
                    <Expandable icon={optionsIcon} label="Options" defaultExpanded={false} unmountOnExit={false}>
                        <OptionsControl selection={selection1} selectionDispatch={selection1Dispatch} />
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
                            <ComparisonViewWidget
                                key={v.viewId}
                                view={v}
                                sortingComparisonViewProps={sortingComparisonViewProps}
                            />
                        ))
                    }
                </ViewContainer>
            </Splitter>
        </div>
    )
}

export default MVSortingComparisonViewWithCheck
