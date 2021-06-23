// LABBOX-EXTENSION: spikeamplitudes
// LABBOX-EXTENSION-TAGS: jupyter

import ScatterPlotIcon from '@material-ui/icons/ScatterPlot';
import React from 'react';
import { LabboxExtensionContext } from '../../pluginInterface';
import SpikeAmplitudesUnitView from './SpikeAmplitudesView/SpikeAmplitudesUnitView';
import SpikeAmplitudesView from './SpikeAmplitudesView/SpikeAmplitudesView';


export function activate(context: LabboxExtensionContext) {
    context.registerPlugin({
        type: 'SortingView',
        name: 'SpikeAmplitudes',
        label: 'Spike amplitudes',
        priority: 50,
        defaultExpanded: false,
        component: SpikeAmplitudesView,
        singleton: false,
        icon: <ScatterPlotIcon />
    })
    context.registerPlugin({
        type: 'SortingUnitView',
        name: 'SpikeAmplitudes',
        label: 'Spike amplitudes',
        priority: 50,
        fullWidth: true,
        component: SpikeAmplitudesUnitView,
        icon: <ScatterPlotIcon />
    })
}