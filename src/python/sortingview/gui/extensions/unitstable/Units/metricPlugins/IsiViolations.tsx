import React from 'react';
import { SortingUnitMetricPlugin } from "../../../../pluginInterface";

const IsiViolations = (record: any) => {
    return (
        <span>{record !== undefined ? record.toFixed(2): ''}</span>
    );
}

const plugin: SortingUnitMetricPlugin = {
    type: 'SortingUnitMetric',
    name: 'IsiViolations',
    label: 'ISI viol.',
    columnLabel: 'ISI viol.',
    tooltip: 'ISI violation rate',
    hitherFnName: 'get_isi_violation_rates.1',
    metricFnParams: {
        'isi_threshold_msec': 2.5
        // need to sort out how to pass unit ids list?
    },
    hitherOpts: {
        useClientCache: true
    },
    component: IsiViolations,
    isNumeric: true,
    getValue: (record: any) => record
}

export default plugin