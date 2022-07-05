from typing import Union
import numpy as np
import sortingview.views as vv


def sorting_summary_view(self, *, label: Union[str, None]=None):
    from .SpikeSortingView import SpikeSortingView
    assert isinstance(self, SpikeSortingView)

    if label is None:
        label = 'Summary'

    traces_sample = self.get_traces_sample(segment=0)
    noise_level = estimate_noise_level(traces_sample)

    return vv.SortingSummary(
        recording_description='',
        sorting_description='',
        recording_object=self.recording_object,
        sorting_object=self.sorting_object,
        unit_ids=self.unit_ids,
        channel_ids=self.channel_ids,
        sampling_frequency=float(self.sampling_frequency),
        num_frames=self.num_frames,
        num_segments=self.num_segments,
        channel_locations=self.channel_locations.astype(np.float32),
        noise_level=float(noise_level)
    )

def estimate_noise_level(traces: np.ndarray):
    est_noise_level = np.median(np.abs(traces - np.mean(traces, axis=0))) / 0.6745  # median absolute deviation (MAD) estimate of stdev
    return est_noise_level