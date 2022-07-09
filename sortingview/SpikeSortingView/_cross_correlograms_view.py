from typing import List
from .helpers.compute_correlogram_data import compute_correlogram_data
import sortingview.views as vv


def cross_correlograms_view(self, *, unit_ids: List[int], hide_unit_selector: bool=False):
    from .SpikeSortingView import SpikeSortingView
    assert isinstance(self, SpikeSortingView)

    cross_correlograms: vv.CrossCorrelogramItem = []
    for unit_id1 in unit_ids:
        times1 = self.get_unit_spike_train(unit_id=unit_id1)
        for unit_id2 in unit_ids:
            times2 = self.get_unit_spike_train(unit_id=unit_id2)
            if unit_id1 == unit_id2:
                a = compute_correlogram_data(times1=times1, times2=None, sampling_frequency=self.sampling_frequency, window_size_msec=50, bin_size_msec=1)
            else:
                a = compute_correlogram_data(times1=times1, times2=times2, sampling_frequency=self.sampling_frequency, window_size_msec=50, bin_size_msec=1)
            bin_edges_sec = a['bin_edges_sec']
            bin_counts = a['bin_counts']
            cross_correlograms.append(vv.CrossCorrelogramItem(
                unit_id1=unit_id1,
                unit_id2=unit_id2,
                bin_edges_sec=bin_edges_sec,
                bin_counts=bin_counts
            ))
    
    return vv.CrossCorrelograms(
        cross_correlograms=cross_correlograms,
        hide_unit_selector=hide_unit_selector
    )
