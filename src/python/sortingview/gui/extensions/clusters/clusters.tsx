// LABBOX-EXTENSION: clusters
// LABBOX-EXTENSION-TAGS: jupyter

import { BubbleChart } from '@material-ui/icons';
import React from 'react';
import { LabboxExtensionContext } from '../../pluginInterface';
import IndividualClustersView from './IndividualClustersView/IndividualClustersView';

export function activate(context: LabboxExtensionContext) {
    context.registerPlugin({
        type: 'SortingView',
        name: 'IndividualClustersView',
        label: 'Clusters',
        priority: 50,
        component: IndividualClustersView,
        icon: <BubbleChart />
    })
}