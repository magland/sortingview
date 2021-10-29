from typing import List, Union
import numpy as np
from .helpers.compute_correlogram_data import compute_correlogram_data
from .Figure import Figure


def create_spike_amplitudes(self, *, unit_ids: List[int], label: Union[str, None]=None):
    from .SpikeSortingView import SpikeSortingView
    assert isinstance(self, SpikeSortingView)

    if label is None:
        label = 'Spike amplitudes'

    units = []
    for unit_id in unit_ids:
        spike_times_sec = np.array(self.get_unit_spike_train(unit_id=unit_id)) / self.sampling_frequency
        spike_amplitudes = self.get_unit_spike_amplitudes(unit_id=unit_id)
        units.append({
            'unitId': unit_id,
            'spikeTimesSec': spike_times_sec.astype(np.float32),
            'spikeAmplitudes': spike_amplitudes.astype(np.float32)
        })
    
    traces_sample = self.get_traces_sample(segment=0)
    
    data = {
        'type': 'SpikeAmplitudes',
        'startTimeSec': 0,
        'endTimeSec': self.num_frames / self.sampling_frequency,
        'units': units
    }
    return Figure(data=data, label=label)