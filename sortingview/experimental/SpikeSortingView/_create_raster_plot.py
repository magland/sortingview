from typing import List, Union
import numpy as np
from .Figure import Figure


def create_raster_plot(self, *, unit_ids: List[int], label: Union[str, None]=None):
    from .SpikeSortingView import SpikeSortingView
    assert isinstance(self, SpikeSortingView)

    if label is None:
        label = 'Raster plot'

    plots = []
    for unit_id in unit_ids:
        spike_times_sec = np.array(self.get_unit_spike_train(unit_id=unit_id)) / self.sampling_frequency
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