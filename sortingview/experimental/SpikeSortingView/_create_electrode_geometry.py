from typing import List, Tuple, Union
import numpy as np
from .helpers.compute_correlogram_data import compute_correlogram_data
from .Figure import Figure


def create_electrode_geometry(self, *, label: Union[str, None]=None):
    from .SpikeSortingView import SpikeSortingView
    assert isinstance(self, SpikeSortingView)

    if label is None:
        label = 'Electrode geometry'
    
    channel_locations = {}
    for ii, channel_id in enumerate(self.channel_ids):
        channel_locations[str(channel_id)] = self.channel_locations[ii, :].astype(np.float32)
    data = {
        'type': 'ElectrodeGeometry',
        'channelLocations': channel_locations
    }
    return Figure(data=data, label=label)