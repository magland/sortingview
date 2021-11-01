from typing import Union
import numpy as np
import spikeextractors as se

def create_sorting_from_old_extractor(sx: se.SortingExtractor):
    import spikeinterface as si
    class SortingSegmentWrapper(si.BaseSortingSegment):
        def __init__(self, sx: se.SortingExtractor):
            si.BaseSortingSegment.__init__(self)
            self._sx = sx

        def get_unit_spike_train(self,
            unit_id,
            start_frame: Union[int, None] = None,
            end_frame: Union[int, None] = None,
        ) -> np.ndarray:
            return self._sx.get_unit_spike_train(unit_id=unit_id, start_frame=start_frame, end_frame=end_frame)
            
    S = si.BaseSorting(
        sampling_frequency=sx.get_sampling_frequency(),
        unit_ids=sx.get_unit_ids()
    )
    sorting_segment = SortingSegmentWrapper(sx)
    S.add_sorting_segment(sorting_segment)
    return S