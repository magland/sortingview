import { usePlugins } from 'labbox';
import React, { Fragment, FunctionComponent, useCallback } from 'react';
import { LabboxPlugin, RecordingViewPlugin, recordingViewPlugins, SortingSelection, SortingUnitViewPlugin, sortingUnitViewPlugins, SortingViewPlugin, sortingViewPlugins } from "../../pluginInterface";
import sortByPriority from '../../sortByPriority';

export type ViewPluginType = 'RecordingView' | 'SortingView' | 'SortingUnitView'

type Props = {
    selection: SortingSelection
    onLaunchSortingView: (plugin: SortingViewPlugin) => void
    onLaunchRecordingView: (plugin: RecordingViewPlugin) => void
    onLaunchSortingUnitView: (plugin: SortingUnitViewPlugin, unitId: number, label: string) => void
    hasSorting: boolean
}

const buttonStyle: React.CSSProperties = {
    fontSize: 12,
    padding: 4,
    margin: 1
}

const ViewLauncher: FunctionComponent<Props> = ({ onLaunchSortingView, onLaunchRecordingView, onLaunchSortingUnitView, selection, hasSorting }) => {
    const plugins = usePlugins<LabboxPlugin>()
    const sortingUnitViewPlugin = sortingUnitViewPlugins(plugins).filter(p => (p.name === 'MVSortingUnitView'))[0]
    return (
        <Fragment>
            <div key="recordingViews" style={{flexFlow: 'wrap'}}>
                {
                    sortByPriority(recordingViewPlugins(plugins)).filter(p => (p.name !== 'MVRecordingView')).map(rv => (
                        <LaunchRecordingViewButton key={rv.name} plugin={rv} onLaunch={onLaunchRecordingView} />
                    ))
                }
            </div>
            { hasSorting && (
                <div key="sortingViews" style={{flexFlow: 'wrap'}}>
                    {
                        sortByPriority(sortingViewPlugins(plugins)).filter(p => (p.name !== 'MVSortingView')).map(sv => (
                            <LaunchSortingViewButton key={sv.name} plugin={sv} onLaunch={onLaunchSortingView} />
                        ))
                    }
                </div>
            ) }
            {/* <hr></hr>
            <div key="sortingUnitViews" style={{flexFlow: 'wrap'}}>
                {
                    Object.values(plugins.sortingUnitViews).map(sv => (
                        <LaunchButton key={sv.name} pluginType="SortingUnitView" plugin={sv} onLaunch={handleLaunch} />
                    ))
                }
            </div> */}
            {/* <hr></hr>
            <div key="recordingViews" style={{flexFlow: 'wrap'}}>
                {
                    Object.values(plugins.recordingViews).map(sv => (
                        <LaunchButton key={sv.name} pluginType="RecordingView" plugin={sv} onLaunch={handleLaunch} />
                    ))
                }
            </div> */}
            {/* <hr></hr> */}
            {
                <div key="view-single-unit">
                {
                    sortingUnitViewPlugin && (selection.selectedUnitIds || []).map(unitId => (
                        <LaunchSortingUnitViewButton key={'unit-' + unitId} plugin={sortingUnitViewPlugin} unitId={unitId} label={`Unit ${unitId}`} onLaunch={onLaunchSortingUnitView} />
                    ))
                }
                </div>
            }
        </Fragment>
    )
}

type LaunchSortingViewButtonProps = {
    plugin: SortingViewPlugin
    onLaunch: (plugin: SortingViewPlugin) => void
}

const LaunchSortingViewButton: FunctionComponent<LaunchSortingViewButtonProps> = ({ plugin, onLaunch }) => {
    const handleClick = useCallback(() => {
        onLaunch(plugin)
    }, [onLaunch, plugin])
    return (
        <button onClick={handleClick} style={buttonStyle}>{
            plugin.icon && (
                <plugin.icon.type {...plugin.icon.props} style={{height: 14, width: 14, paddingRight: 2, paddingTop: 0}} />
            )}{plugin.label}</button>
    )
}

type LaunchRecordingViewButtonProps = {
    plugin: RecordingViewPlugin
    onLaunch: (plugin: RecordingViewPlugin) => void
}

const LaunchRecordingViewButton: FunctionComponent<LaunchRecordingViewButtonProps> = ({ plugin, onLaunch }) => {
    const handleClick = useCallback(() => {
        onLaunch(plugin)
    }, [onLaunch, plugin])
    return (
        <button onClick={handleClick} style={buttonStyle}>{
            plugin.icon && (
                <plugin.icon.type {...plugin.icon.props} style={{height: 14, width: 14, paddingRight: 2, paddingTop: 0}} />
            )}{plugin.label}</button>
    )
}


type LaunchSortingUnitViewButtonProps = {
    plugin: SortingUnitViewPlugin
    unitId: number
    label: string
    onLaunch: (plugin: SortingUnitViewPlugin, unitId: number, label: string) => void
}

const LaunchSortingUnitViewButton: FunctionComponent<LaunchSortingUnitViewButtonProps> = ({ plugin, unitId, label, onLaunch }) => {
    const handleClick = useCallback(() => {
        onLaunch(plugin, unitId, label)
    }, [onLaunch, plugin, unitId, label])
    return (
        <button onClick={handleClick} style={buttonStyle}>{plugin.icon && <span style={{paddingRight: 5}}>{plugin.icon}</span>}{label}</button>
    )
}

export default ViewLauncher