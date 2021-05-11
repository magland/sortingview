import React from 'react';
import { SortingUnitMetricPlugin } from "../../../../pluginInterface";

const PeakChannels = (record: any) => {
    return (
        <span>{record !== undefined ? record : ''}</span>
    );
}

const plugin: SortingUnitMetricPlugin = {
    type: 'SortingUnitMetric',
    name: 'PeakChannels',
    label: 'Peak chan.',
    columnLabel: 'Peak chan.',
    tooltip: 'ID of channel where the peak-to-peak amplitude is maximal',
    hitherFnName: 'get_peak_channels.1',
    metricFnParams: {},
    hitherOpts: {
        useClientCache: true
    },
    component: PeakChannels,
    isNumeric: true,
    getValue: (record: any) => record
}

export default plugin