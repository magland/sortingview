from typing import Any, Dict, List, Tuple, Union
import numpy as np
from .View import View


class SpikeLocationsItem:
    """
    Single unit spike locations
    """
    def __init__(self,
        unit_id: Union[int, str],
        spike_times_sec: np.array,
        x_locations: np.array,
        y_locations: np.array
    ) -> None:
        self.unit_id = unit_id
        self.spike_times_sec = spike_times_sec
        self.x_locations = x_locations
        self.y_locations = y_locations
    def to_dict(self):
        ret = {
            'unitId': self.unit_id,
            'spikeTimesSec': self.spike_times_sec,
            'xLocations': self.x_locations,
            'yLocations': self.y_locations
        }
        return ret

class SpikeLocations(View):
    """
    Spike locations view
    """
    def __init__(self,
        units: List[SpikeLocationsItem], *,
        x_range: Tuple[float, float],
        y_range: Tuple[float, float],
        hide_unit_selector: bool,
        channel_locations: Dict[str, Any],
        disable_auto_rotate: bool=False,
        **kwargs
    ) -> None:
        super().__init__('SpikeLocations', **kwargs)
        self._units = units
        self._x_range = x_range
        self._y_range = y_range
        self._hide_unit_selector = hide_unit_selector
        self._channel_locations = channel_locations
        self._disable_auto_rotate = disable_auto_rotate
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'units': [a.to_dict() for a in self._units],
            'xRange': [self._x_range[0], self._x_range[1]],
            'yRange': [self._y_range[0], self._y_range[1]],
            'hideUnitSelector': self._hide_unit_selector,
            'channelLocations': self._channel_locations,
            'disableAutoRotate': self._disable_auto_rotate
        }
        return ret
    def child_views(self) -> List[View]:
        return []
