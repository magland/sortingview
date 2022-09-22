from typing import List, Optional
import numpy as np
from ..View import View

class DecodedLinearPositionData(View):
    def __init__(self, *,
        values: np.array,
        positions: np.array,
        frame_bounds: np.array,
        sampling_frequency: Optional[float]
    ) -> None:
        self.values = values
        self.positions = positions
        self.frame_bounds = frame_bounds
        self.sampling_frequency = sampling_frequency

    def to_dict(self) -> dict:
        ret = {
            'type': 'DecodedLinearPositionData',
            'values': self.values,
            'positions': self.positions,
            'frameBounds': self.frame_bounds,
            'samplingFrequencyHz': self.sampling_frequency
        }
        return ret

    def child_views(self) -> List[View]:
        return []