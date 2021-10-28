from typing import List, Union
from .helpers.compute_correlogram_data import compute_correlogram_data
from .Figure import Figure


def create_autocorrelograms(self, *, unit_ids: List[int], label: Union[str, None]=None):
    from .SpikeSortingView import SpikeSortingView
    assert isinstance(self, SpikeSortingView)

    if label is None:
        label = 'Autocorrelograms'

    autocorrelograms = []
    for unit_id in unit_ids:
        times = self.get_unit_spike_train(unit_id=unit_id)
        a = compute_correlogram_data(times1=times, times2=None, sampling_frequency=self.sampling_frequency, window_size_msec=50, bin_size_msec=1)
        bin_edges_sec = a['bin_edges_sec']
        bin_counts = a['bin_counts']
        autocorrelograms.append({
            'unitId': unit_id,
            'binEdgesSec': bin_edges_sec,
            'binCounts': bin_counts
        })
    
    data = {
        'type': 'Autocorrelograms',
        'autocorrelograms': autocorrelograms
    }
    return Figure(data=data, label=label)