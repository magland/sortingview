import { FunctionComponent } from "react";
import { BaseLabboxPlugin, WorkspaceRoute, WorkspaceRouteDispatch } from ".";
import { WorkspaceDispatch, WorkspaceState } from "./workspaceReducer";

export type WorkspaceViewProps = {
    workspace: WorkspaceState
    workspaceDispatch: WorkspaceDispatch | undefined
    workspaceRoute: WorkspaceRoute
    workspaceRouteDispatch: WorkspaceRouteDispatch
    width: number
    height: number
}

export interface WorkspaceViewPlugin extends BaseLabboxPlugin {
    type: 'WorkspaceView'
    component: FunctionComponent<WorkspaceViewProps>
}