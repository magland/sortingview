// LABBOX-EXTENSION: unitcomparison
// LABBOX-EXTENSION-TAGS: jupyter

import Icon from '@material-ui/icons/AirlineSeatLegroomExtraTwoTone';
import React from 'react';
import { LabboxExtensionContext } from "../../pluginInterface";
import UnitComparisonView from './UnitComparisonView';

export function activate(context: LabboxExtensionContext) {
    context.registerPlugin({
        type: 'SortingView',
        name: 'UnitComparison',
        label: 'Unit comparison',
        priority: 50,
        component: UnitComparisonView,
        icon: <Icon />,
        singleton: true
    })
}