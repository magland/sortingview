import numpy as np
from typing import List, Union
from .View import View


class PositionPlot(View):
    """
    Position plot view
    """
    def __init__(self, *,
        timestamps: np.array,
        positions: np.array,
        dimension_labels: List[str],
        subsampling_frequency: Union[float, None]=None,
        discontinuous: bool=False,
        **kwargs
    ) -> None:
        super().__init__('PositionPlot', **kwargs)
        self.timestamps = timestamps
        self.positions = positions
        self.dimension_labels = dimension_labels
        self.subsampling_frequency = subsampling_frequency
        self.discontinuous = discontinuous
    def to_dict(self) -> dict:
        timestamps = self.timestamps
        positions = self.positions
        dimension_labels = self.dimension_labels
        subsampling_frequency = self.subsampling_frequency
        discontinuous = self.discontinuous
        if positions.ndim == 1:
            positions = np.reshape(positions, (len(positions), 1))
        assert positions.shape[0] == len(timestamps)
        assert len(dimension_labels) == positions.shape[1]
        if subsampling_frequency is not None:
            inds = _get_subsample_inds(timestamps, subsampling_frequency)
            timestamps = timestamps[inds]
            positions = positions[inds, :]
        ret = {
            'type': self.type,
            'timeOffset': timestamps[0],
            'timestamps': (timestamps - timestamps[0]).astype(np.float32),
            'positions': positions,
            'dimensionLabels': dimension_labels,
            'discontinuous': discontinuous
        }
        return ret
    def child_views(self) -> List[View]:
        return []

def _get_subsample_inds(timestamps: np.array, sampling_frequency: float):
    dt = 1 / sampling_frequency
    ret = []
    last_t = timestamps[0] - dt * 2
    for i in range(len(timestamps)):
        delta = timestamps[i] - last_t
        if delta >= dt * 0.95:
            ret.append(i)
            last_t = timestamps[i]
    return ret