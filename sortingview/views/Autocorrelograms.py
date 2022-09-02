import numpy as np
from typing import List, Union
from .View import View


class AutocorrelogramItem:
    """
    Single autocorrelogram item (single box)
    """
    def __init__(self,
        unit_id: Union[int, str],
        bin_edges_sec: Union[np.array, List[float]],
        bin_counts: Union[np.array, List[float]]
    ) -> None:
        self.unit_id = unit_id
        self.bin_edges_sec = bin_edges_sec
        self.bin_counts = bin_counts
    def to_dict(self):
        return {
            'unitId': self.unit_id,
            'binEdgesSec': self.bin_edges_sec,
            'binCounts': self.bin_counts
        }

class Autocorrelograms(View):
    """
    Autocorrelograms view
    """
    def __init__(self,
        autocorrelograms: List[AutocorrelogramItem],
        **kwargs
    ) -> None:
        super().__init__('Autocorrelograms', **kwargs)
        self._autocorrelograms = autocorrelograms
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'autocorrelograms': [a.to_dict() for a in self._autocorrelograms]
        }
        return ret
    def child_views(self) -> List[View]:
        return []
