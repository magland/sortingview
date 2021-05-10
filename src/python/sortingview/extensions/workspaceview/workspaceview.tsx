import { LabboxExtensionContext } from "../pluginInterface";
import WorkspaceView from "./WorkspaceView";

export function activate(context: LabboxExtensionContext) {
    context.registerPlugin({
        type: 'WorkspaceView',
        name: 'WorkspaceView',
        label: 'Workspace View',
        component: WorkspaceView
    })
}