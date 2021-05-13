// LABBOX-EXTENSION: averagewaveforms
// LABBOX-EXTENSION-TAGS: jupyter

import GrainIcon from '@material-ui/icons/Grain';
import React from 'react';
import { LabboxExtensionContext } from '../../pluginInterface';
import AverageWaveformsView from './AverageWaveformsView/AverageWaveformsView';

export function activate(context: LabboxExtensionContext) {
    context.registerPlugin({
        type: 'SortingView',
        name: 'AverageWaveforms',
        label: 'Average waveforms',
        priority: 50,
        defaultExpanded: false,
        component: AverageWaveformsView,
        singleton: true,
        icon: <GrainIcon />
    })
}