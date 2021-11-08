from typing import List, Tuple, Union
import numpy as np
from .helpers.compute_correlogram_data import compute_correlogram_data
from .Figure import Figure


def create_summary(self, *, label: Union[str, None]=None):
    from .SpikeSortingView import SpikeSortingView
    assert isinstance(self, SpikeSortingView)

    if label is None:
        label = 'Summary'

    traces_sample = self.get_traces_sample(segment=0)
    noise_level = estimate_noise_level(traces_sample)

    data = {
        'type': 'Summary',
        'recordingDescription': '',
        'sortingDescription': '',
        'recordingObject': self.recording_object,
        'sortingObject': self.sorting_object,
        'unitIds': self.unit_ids,
        'channelIds': self.channel_ids,
        'samplingFrequency': float(self.sampling_frequency),
        'numFrames': self.num_frames,
        'numSegments': self.num_segments,
        'channelLocations': self.channel_locations.astype(np.float32),
        'noiseLevel': float(noise_level)
    }
    return Figure(data=data, label=label)

def estimate_noise_level(traces: np.ndarray):
    est_noise_level = np.median(np.abs(traces - np.mean(traces, axis=0))) / 0.6745  # median absolute deviation (MAD) estimate of stdev
    return est_noise_level