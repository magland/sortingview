from typing import List, Union
import numpy as np
from .Figure import Figure

def create_spike_raster_plot(*, times: np.array, labels: np.array, label: str):
    unit_ids = np.sort(np.unique(labels))
    plots = []
    for unit_id in unit_ids:
        inds = np.where(labels == unit_id)[0]
        spike_times_sec = times[inds]
        plots.append({
            'unitId': unit_id,
            'spikeTimesSec': spike_times_sec.astype(np.float32)
        })
    
    data = {
        'type': 'RasterPlot',
        'startTimeSec': np.min(times),
        'endTimeSec': np.max(times),
        'plots': plots
    }
    return Figure(data=data, label=label)