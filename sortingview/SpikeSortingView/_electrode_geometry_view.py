from typing import List, Tuple, Union
import numpy as np
import sortingview.views as vv


def electrode_geometry_view(self):
    from .SpikeSortingView import SpikeSortingView
    assert isinstance(self, SpikeSortingView)

    channel_locations = {}
    for ii, channel_id in enumerate(self.channel_ids):
        channel_locations[str(channel_id)] = self.channel_locations[ii, :].astype(np.float32)
    return vv.ElectrodeGeometry(
        channel_locations=channel_locations
    )
