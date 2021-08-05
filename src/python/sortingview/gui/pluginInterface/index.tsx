import { CalculationPool } from "figurl/kachery-react/createCalculationPool";
import { BasePlugin, ExtensionContext, usePlugins } from "figurl/labbox-react";
import { FunctionComponent, useMemo } from "react";
import { RecordingViewPlugin } from "./RecordingViewPlugin";
import { SortingComparisonUnitMetricPlugin } from "./SortingComparisonUnitMetricPlugin";
import { SortingComparisonViewPlugin } from "./SortingComparisonViewPlugin";
import { SortingUnitMetricPlugin } from "./SortingUnitMetricPlugin";
import { SortingUnitViewPlugin } from "./SortingUnitViewPlugin";
import { SortingViewPlugin } from "./SortingViewPlugin";
import { WorkspaceDispatch, WorkspaceState } from "./workspaceReducer";
import { WorkspaceRoute, WorkspaceRouteDispatch } from './WorkspaceRoute';
import { WorkspaceViewPlugin } from "./WorkspaceViewPlugin";

export type { Recording, RecordingInfo } from './Recording';
export { recordingSelectionReducer } from './RecordingSelection';
export type { RecordingSelection, RecordingSelectionAction, RecordingSelectionDispatch, WaveformsMode } from './RecordingSelection';
export type { RecordingViewPlugin, RecordingViewProps } from './RecordingViewPlugin';
export type { Sorting, SortingInfo } from './Sorting';
export type { SortingComparisonUnitMetricPlugin } from './SortingComparisonUnitMetricPlugin';
export type { SortingComparisonViewPlugin, SortingComparisonViewProps } from './SortingComparisonViewPlugin';
export { applyMergesToUnit, isMergeGroupRepresentative, mergeGroupForUnitId } from './SortingCuration';
export type { SortingCuration, SortingCurationDispatch } from './SortingCuration';
export { sortingSelectionReducer } from './SortingSelection';
export type { SortingSelection, SortingSelectionAction, SortingSelectionDispatch } from './SortingSelection';
export type { SortingUnitMetricPlugin } from './SortingUnitMetricPlugin';
export type { SortingUnitViewPlugin, SortingUnitViewProps } from './SortingUnitViewPlugin';
export type { SortingViewPlugin, SortingViewProps } from './SortingViewPlugin';
export type { WorkspaceRoute, WorkspaceRouteDispatch } from './WorkspaceRoute';


export type MainWindowProps = {
    workspace: WorkspaceState
    workspaceDispatch: WorkspaceDispatch
    workspaceRoute: WorkspaceRoute
    workspaceRouteDispatch: WorkspaceRouteDispatch
    version: string
    width?: number
    height?: number
}
export interface MainWindowPlugin extends BaseLabboxPlugin {
    type: 'MainWindow'
    name: string
    label: string
    component: FunctionComponent<MainWindowProps>
}

export interface BaseLabboxPlugin extends BasePlugin {
    priority?: number
    disabled?: boolean
    development?: boolean
}

export interface LabboxViewPlugin extends BaseLabboxPlugin {
    props?: {[key: string]: any}
    fullWidth?: boolean
    defaultExpanded?: boolean
    singleton?: boolean
}

export interface LabboxViewProps {
    plugins: LabboxPlugin
    calculationPool?: CalculationPool
    width?: number
    height?: number
}

export const filterPlugins = (plugins: LabboxPlugin[]) => {
    return plugins.filter(p => ((!p.disabled) && (!p.development)))
}

export const sortingViewPlugins = (plugins: LabboxPlugin[]): SortingViewPlugin[] => {
    return filterPlugins(plugins).filter(p => (p.type === 'SortingView'))
        .map(p => (p as any as SortingViewPlugin))
}

export const sortingComparisonViewPlugins = (plugins: LabboxPlugin[]): SortingComparisonViewPlugin[] => {
    return filterPlugins(plugins).filter(p => (p.type === 'SortingComparisonView'))
        .map(p => (p as any as SortingComparisonViewPlugin))
}

export const recordingViewPlugins = (plugins: LabboxPlugin[]): RecordingViewPlugin[] => {
    return filterPlugins(plugins).filter(p => (p.type === 'RecordingView'))
        .map(p => (p as any as RecordingViewPlugin))
}

export const sortingUnitViewPlugins = (plugins: LabboxPlugin[]): SortingUnitViewPlugin[] => {
    return filterPlugins(plugins).filter(p => (p.type === 'SortingUnitView'))
        .map(p => (p as any as SortingUnitViewPlugin))
}

export const sortingUnitMetricPlugins = (plugins: LabboxPlugin[]): SortingUnitMetricPlugin[] => {
    return filterPlugins(plugins).filter(p => (p.type === 'SortingUnitMetric'))
        .map(p => (p as any as SortingUnitMetricPlugin))
}

export const sortingComparisonUnitMetricPlugins = (plugins: LabboxPlugin[]): SortingComparisonUnitMetricPlugin[] => {
    return filterPlugins(plugins).filter(p => (p.type === 'SortingComparisonUnitMetric'))
        .map(p => (p as any as SortingComparisonUnitMetricPlugin))
}

export type LabboxPlugin = MainWindowPlugin | WorkspaceViewPlugin | SortingViewPlugin | SortingComparisonViewPlugin | RecordingViewPlugin | SortingUnitViewPlugin | SortingUnitMetricPlugin | SortingComparisonUnitMetricPlugin

export type LabboxExtensionContext = ExtensionContext<LabboxPlugin>

export const useWorkspaceViewPlugins = (): WorkspaceViewPlugin[] => {
    const plugins = usePlugins<LabboxPlugin>()
    return useMemo(() => (
        plugins.filter(p => (p.type === 'WorkspaceView')).map(p => (p as any as WorkspaceViewPlugin))
    ), [plugins])
}