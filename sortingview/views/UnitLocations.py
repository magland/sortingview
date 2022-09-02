from typing import Any, Dict, List, Union
from .View import View


class UnitLocationsItem:
    """
    Single unit location
    """
    def __init__(self,
        unit_id: Union[int, str],
        x: float,
        y: float
    ) -> None:
        self.unit_id = unit_id
        self.x = x
        self.y = y
    def to_dict(self):
        ret = {
            'unitId': self.unit_id,
            'x': self.x,
            'y': self.y
        }
        return ret

class UnitLocations(View):
    """
    Unit locations view
    """
    def __init__(self,
        units: List[UnitLocationsItem], *,
        channel_locations: Dict[str, Any],
        disable_auto_rotate: bool=False,
        **kwargs
    ) -> None:
        super().__init__('UnitLocations', **kwargs)
        self._units = units
        self._channel_locations = channel_locations
        self._disable_auto_rotate = disable_auto_rotate
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'units': [a.to_dict() for a in self._units],
            'channelLocations': self._channel_locations,
            'disableAutoRotate': self._disable_auto_rotate
        }
        return ret
    def child_views(self) -> List[View]:
        return []
