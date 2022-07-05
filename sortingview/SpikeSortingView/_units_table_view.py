from typing import List, Union
import numpy as np
import sortingview.views as vv


def units_table_view(self, *, unit_ids: List[int], unit_metrics: Union[List[dict], None]=None, label: Union[str, None]=None):
    from .SpikeSortingView import SpikeSortingView
    assert isinstance(self, SpikeSortingView)

    if label is None:
        label = 'Units table'

    traces_sample = self.get_traces_sample(segment=0)
    noise_level = estimate_noise_level(traces_sample)

    columns: List[vv.UnitsTableColumn] = [
        vv.UnitsTableColumn(
            key='unitId',
            label='Unit',
            dtype='int'
        ),
        vv.UnitsTableColumn(
            key='numEvents',
            label='Num. events',
            dtype='int'
        ),
        vv.UnitsTableColumn(
            key='firingRateHz',
            label='Firing rate (Hz)',
            dtype='float'
        ),
        vv.UnitsTableColumn(
            key='snr',
            label='SNR',
            dtype='float'
        )
    ]
    if unit_metrics is not None:
        for u in unit_metrics:
            columns.append(vv.UnitsTableColumn(
                key=f'metric:{u["name"]}',
                label=u['label'],
                dtype='float'
            ))
    rows: List[vv.UnitsTableRow] = []
    for unit_id in unit_ids:
        spike_train = self.get_unit_spike_train(unit_id=unit_id)
        spike_amplitudes = self.get_unit_spike_amplitudes(unit_id=unit_id)
        avg_spike_amplitude = np.mean(spike_amplitudes)
        snr = np.abs(avg_spike_amplitude) / noise_level
        values = {
            'unitId': unit_id,
            'numEvents': len(spike_train),
            'firingRateHz': len(spike_train) / (self.num_frames / self.sampling_frequency),
            'snr': snr
        }
        if unit_metrics is not None:
            for u in unit_metrics:
                d = u['data'].get(str(unit_id), None)
                if d is not None:
                    values[f'metric:{u["name"]}'] = d
        rows.append(vv.UnitsTableRow(
            unit_id=unit_id,
            values=values
        ))
    view = vv.UnitsTable(
        columns=columns,
        rows=rows
    )
    return view

def estimate_noise_level(traces: np.ndarray):
    est_noise_level = np.median(np.abs(traces - np.mean(traces, axis=0))) / 0.6745  # median absolute deviation (MAD) estimate of stdev
    return est_noise_level
