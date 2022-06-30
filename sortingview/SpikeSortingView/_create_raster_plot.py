from typing import List, Union
import numpy as np
from .Figure import Figure


def create_raster_plot(self, *, unit_ids: List[int], label: Union[str, None]=None, _subsample_max_firing_rate: Union[float, None]=None):
    from .SpikeSortingView import SpikeSortingView
    assert isinstance(self, SpikeSortingView)

    if label is None:
        label = 'Raster plot'

    plots = []
    for unit_id in unit_ids:
        spike_times_sec = np.array(self.get_unit_spike_train(unit_id=unit_id)) / self.sampling_frequency
        if _subsample_max_firing_rate is not None:
            max_num = int(self.num_frames / self.sampling_frequency * _subsample_max_firing_rate)
            if len(spike_times_sec) > max_num:
                spike_times_sec = _subsample(spike_times_sec, max_num)
        plots.append({
            'unitId': unit_id,
            'spikeTimesSec': spike_times_sec.astype(np.float32)
        })

    data = {
        'type': 'RasterPlot',
        'startTimeSec': 0,
        'endTimeSec': self.num_frames / self.sampling_frequency,
        'plots': plots
    }
    return Figure(data=data, label=label)

def _subsample(x: np.array, num: int):
    if num >= len(x):
        return x
    incr = len(x) / num
    inds = np.floor(np.arange(num) * incr).astype(np.int32)
    return x[inds]
