// LABBOX-EXTENSION: mountainview
// LABBOX-EXTENSION-TAGS: jupyter

import { LabboxExtensionContext } from "../../pluginInterface";
import MVSortingUnitView from './MVSortingUnitView/MVSortingUnitView';
import MVSortingView from './MVSortingView/MVSortingView';
import MVRecordingView from './MVSortingView/MVRecordingView';
import MVSortingComparisonView from "./MVSortingComparisonView/MVSortingComparisonView";

export function activate(context: LabboxExtensionContext) {
    context.registerPlugin({
        type: 'SortingView',
        name: 'MVSortingView',
        label: 'MVSortingView',
        priority: 5000,
        defaultExpanded: true,
        notebookCellHeight: 800,
        component: MVSortingView
    })
    context.registerPlugin({
        type: 'SortingComparisonView',
        name: 'MVSortingComparisonView',
        label: 'MVSortingComparisonView',
        priority: 5000,
        defaultExpanded: true,
        notebookCellHeight: 800,
        component: MVSortingComparisonView
    })
    context.registerPlugin({
        type: 'RecordingView',
        name: 'MVRecordingView',
        label: 'MVRecordingView',
        priority: 5000,
        defaultExpanded: true,
        notebookCellHeight: 800,
        component: MVRecordingView
    })
    context.registerPlugin({
        type: 'SortingUnitView',
        name: 'MVSortingUnitView',
        label: 'MV sorting unit view',
        component: MVSortingUnitView
    })
}