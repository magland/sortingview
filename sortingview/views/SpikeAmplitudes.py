import numpy as np
from typing import List, Union
from .View import View


class SpikeAmplitudesItem:
    """
    Spike amplitudes for a single unit
    """
    def __init__(self,
        unit_id: Union[int, str],
        spike_times_sec: np.array,
        spike_amplitudes: np.array
    ) -> None:
        self.unit_id = unit_id
        self.spike_times_sec = spike_times_sec
        self.spike_amplitudes = spike_amplitudes
    def to_dict(self):
        ret = {
            'unitId': self.unit_id,
            'spikeTimesSec': self.spike_times_sec,
            'spikeAmplitudes': self.spike_amplitudes
        }
        return ret

class SpikeAmplitudes(View):
    """
    Spike amplitudes view
    """
    def __init__(self, *,
        start_time_sec: float,
        end_time_sec: float,
        plots: List[SpikeAmplitudesItem],
        hide_unit_selector: bool=False,
        **kwargs
    ) -> None:
        super().__init__('SpikeAmplitudes', **kwargs)
        self._start_time_sec = start_time_sec
        self._end_time_sec = end_time_sec
        self._plots = plots
        self._hide_unit_selector = hide_unit_selector
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'startTimeSec': self._start_time_sec,
            'endTimeSec': self._end_time_sec,
            'units': [a.to_dict() for a in self._plots],
            'hideUnitSelector': self._hide_unit_selector
        }
        return ret
    def child_views(self) -> List[View]:
        return []
