from typing import Dict, List, cast
import numpy as np
import spikeextractors as se

class CuratedSortingExtractor(se.SortingExtractor):
    def __init__(self, *, parent_sorting: se.SortingExtractor, merge_groups: List[List[int]]):
        se.SortingExtractor.__init__(self)
        self._parent_sorting = parent_sorting
        self._merge_groups = merge_groups
        uids = cast(List[int], parent_sorting.get_unit_ids())
        self._unit_mapping: Dict[int, int] = {}
        self._merge_groups_by_unit_id: Dict[int, List[int]] = {}
        for u in uids:
            self._unit_mapping[u] = u
            self._merge_groups_by_unit_id[u]= [u]
        for mg in merge_groups:
            minval = min(mg)
            for x in mg:
                self._unit_mapping[x] = minval
                self._merge_groups_by_unit_id[x] = mg
        self._unit_ids = [u for u in uids if (self._unit_mapping[u] == u)]
        self._sampling_frequency = parent_sorting.get_sampling_frequency()

    def get_unit_ids(self):
        return self._unit_ids

    def get_unit_spike_train(self, unit_id, start_frame=None, end_frame=None):
        mg = self._merge_groups_by_unit_id[unit_id]
        trains = [self._parent_sorting.get_unit_spike_train(unit_id=x) for x in mg]
        if len(trains) == 1:
            return trains[0]
        else:
            return np.sort(np.concatenate(trains))

    def get_sampling_frequency(self):
        return self._sampling_frequency
