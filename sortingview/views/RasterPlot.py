import numpy as np
from typing import List, Union
from .View import View


class RasterPlotItem:
    """
    Spike train for a single unit in a raster plot
    """
    def __init__(self,
        unit_id: Union[int, str],
        spike_times_sec: np.array
    ) -> None:
        self.unit_id = unit_id
        self.spike_times_sec = spike_times_sec
    def to_dict(self):
        ret = {
            'unitId': self.unit_id,
            'spikeTimesSec': self.spike_times_sec
        }
        return ret

class RasterPlot(View):
    """
    Raster plot view
    """
    def __init__(self, *,
        start_time_sec: float,
        end_time_sec: float,
        plots: List[RasterPlotItem],
        **kwargs
    ) -> None:
        super().__init__('RasterPlot', **kwargs)
        self._start_time_sec = start_time_sec
        self._end_time_sec = end_time_sec
        self._plots = plots
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'startTimeSec': self._start_time_sec,
            'endTimeSec': self._end_time_sec,
            'plots': [a.to_dict() for a in self._plots]
        }
        return ret
    def child_views(self) -> List[View]:
        return []
