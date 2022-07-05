from typing import Any, Dict, List
from .View import View


class ElectrodeGeometry(View):
    """
    Electrode geometry view
    """
    def __init__(self, channel_locations: Dict[str, Any]) -> None:
        super().__init__('ElectrodeGeometry')
        self.channel_locations = channel_locations
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'channelLocations': self.channel_locations
        }
        return ret
    def child_views(self) -> List[View]:
        return []
