from typing import Union
import numpy as np
import spikeextractors as se

class SubsampledSortingExtractor(se.SortingExtractor):
    # method: 'random', 'truncate'
    def __init__(self, parent_sorting, *, max_events_per_unit: Union[int, None]=None, method='random'):
        se.SortingExtractor.__init__(self)
        self._parent_sorting = parent_sorting
        self._subsampled_spike_trains_by_unit = {}
        unit_ids = parent_sorting.get_unit_ids()
        for unit_id in unit_ids:
            if max_events_per_unit is not None:
                st = parent_sorting.get_unit_spike_train(unit_id=unit_id)
                if len(st) > max_events_per_unit:
                    if method == 'random':
                        indices = np.sort(np.random.RandomState(seed=0).choice(np.arange(len(st)), size=max_events_per_unit, replace=False))
                    elif method == 'truncate':
                        indices = np.arange(max_events_per_unit)
                    else:
                        raise Exception('Unexpected method in SubsampledSortingExtractor')
                    self._subsampled_spike_trains_by_unit[int(unit_id)] = st[indices]
                else:
                    self._subsampled_spike_trains_by_unit[int(unit_id)] = None
            else:
                self._subsampled_spike_trains_by_unit[int(unit_id)] = None
        
    def make_serialized_dict(self):
        # this is necessary because the base class implementation
        # seems to have a bug where it asks for imported_module.__version__, which may not be defined
        return None

    def get_unit_ids(self):
        return self._parent_sorting.get_unit_ids()

    def get_unit_spike_train(self, unit_id, start_frame=None, end_frame=None):
        st2 = self._subsampled_spike_trains_by_unit[int(unit_id)]
        if st2 is None:
            return self._parent_sorting.get_unit_spike_train(unit_id=unit_id, start_frame=start_frame, end_frame=end_frame)
        if start_frame is None and end_frame is None:
            return st2
        if start_frame is None:
            start_frame = 0
        if end_frame is None:
            end_frame = np.Inf
        return st2[(start_frame <= st2) & (st2 < end_frame)]

    def get_sampling_frequency(self):
        return self._parent_sorting.get_sampling_frequency()