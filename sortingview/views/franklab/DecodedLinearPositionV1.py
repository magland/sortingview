from typing import List, Optional
import numpy as np
from ..View import View

class DecodedLinearPositionData(View):
    def __init__(self, *,
        values: np.ndarray,
        positions: np.ndarray,
        frame_bounds: np.ndarray,
        positions_key: np.ndarray,
        observed_positions: Optional[np.ndarray],
        start_time_sec: Optional[float],
        sampling_frequency: Optional[float],
        **kwargs
    ) -> None:
        super().__init__('DecodedLinearPositionData', **kwargs)
        self.values = values
        self.positions = positions
        self.frame_bounds = frame_bounds
        self.positions_key = positions_key
        if (observed_positions is not None):
            self.observed_positions = observed_positions.astype('float32')
        self.start_time_sec = 0 if start_time_sec == None else start_time_sec
        self.sampling_frequency = sampling_frequency

    def to_dict(self) -> dict:
        ret = {
            'type': 'DecodedLinearPositionData',
            'values': self.values,
            'positions': self.positions,
            'frameBounds': self.frame_bounds,
            'positionsKey': self.positions_key,
            'startTimeSec': self.start_time_sec,
            'samplingFrequencyHz': self.sampling_frequency
        }
        if self.observed_positions is not None:
            ret['observedPositions'] = self.observed_positions
        return ret

    def child_views(self) -> List[View]:
        return []