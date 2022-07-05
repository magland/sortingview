from typing import List, Union
import numpy as np
import sortingview.views as vv


def average_waveforms_view(self, *, unit_ids: List[int], label: Union[str, None]=None):
    from .SpikeSortingView import SpikeSortingView
    assert isinstance(self, SpikeSortingView)

    if label is None:
        label = 'Average waveforms'

    traces_sample = self.get_traces_sample(segment=0)
    # noise_level = estimate_noise_level(traces_sample)
    plots: List[vv.AverageWaveformItem] = []
    for unit_id in unit_ids:
        snippets = self.get_unit_subsampled_spike_snippets(unit_id=unit_id)
        waveform = np.mean(snippets, axis=0).astype(np.float32)
        waveform_std_dev = np.sqrt(np.var(snippets, axis=0)).astype(np.float32)
        channel_ids = self.get_unit_channel_neighborhood(unit_id=unit_id)
        plots.append(vv.AverageWaveformItem(
            unit_id=unit_id,
            channel_ids=channel_ids,
            waveform=waveform.T,
            waveform_std_dev=waveform_std_dev.T
        ))
    
    channel_locations = {}
    for ii, channel_id in enumerate(self.channel_ids):
        channel_locations[str(channel_id)] = self.channel_locations[ii, :].astype(np.float32)
    return vv.AverageWaveforms(
        average_waveforms=plots,
        channel_locations=channel_locations
    )

# def estimate_noise_level(traces: np.ndarray):
#     est_noise_level = np.median(np.abs(traces - np.mean(traces, axis=0))) / 0.6745  # median absolute deviation (MAD) estimate of stdev
#     return est_noise_level