// LABBOX-EXTENSION: unitstable
// LABBOX-EXTENSION-TAGS: jupyter

import TableChartIcon from '@material-ui/icons/TableChart';
import React from 'react';
import { LabboxExtensionContext } from "../pluginInterface";
import registerMetricPlugins from "./Units/metricPlugins/registerMetricPlugins";
import Units from './Units/Units';

export function activate(context: LabboxExtensionContext) {
    registerMetricPlugins(context)

    context.registerPlugin({
        type: 'SortingView',
        name: 'UnitsTable',
        label: 'Units Table',
        icon: <TableChartIcon />,
        priority: 200,
        component: Units,
        props: {
            maxHeight: 300
        },
        singleton: true
    })
}