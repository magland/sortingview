// LABBOX-EXTENSION: snippets
// LABBOX-EXTENSION-TAGS: jupyter

import { LabboxExtensionContext } from '../../pluginInterface';
import SnippetsView from './SnippetsView/SnippetsView';

export function activate(context: LabboxExtensionContext) {
    context.registerPlugin({
        type: 'SortingView',
        name: 'SnippetsView',
        label: 'Snippets',
        priority: 50,
        component: SnippetsView
    })
}