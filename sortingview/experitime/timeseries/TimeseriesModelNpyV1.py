from time import time
from typing import Dict, List, Literal, Union
import kachery_client as kc
import numpy as np
from numpy.core.numeric import Infinity
from ._estimate_sampling_frequency import _estimate_sampling_frequency

class TimeseriesModelNpyV1:
    def __init__(self, *, channel_names: List[str], timestamps_uri: str, values_uri: str, type: Union[Literal['continuous'], Literal['discrete']], sampling_frequency: Union[float, None]=None, channel_properties: Union[Dict[str, dict], None]=None):
        self._channel_names = channel_names
        self._channel_properties = channel_properties
        timestamps = kc.load_npy(timestamps_uri)
        values = kc.load_npy(values_uri)
        assert timestamps is not None
        assert timestamps.ndim == 1
        assert values is not None
        assert values.ndim == 2
        assert values.shape[1] == len(channel_names)
        assert values.shape[0] == timestamps.shape[0]
        self._timestamps = timestamps
        self._values = values
        self._type: Union[Literal['continuous'], Literal['discrete']] = type
        sf: Union[float, None] = sampling_frequency
        if sf is None:
            if type == 'continuous':
                sf = _estimate_sampling_frequency(timestamps)
            else:
                sf = 0
        self._sampling_frequency: float = sf
    @property
    def channel_names(self):
        return self._channel_names
    @property
    def channel_properties(self):
        return self._channel_properties
    @property
    def num_samples(self):
        return len(self._timestamps)
    @property
    def start_time(self):
        return self._timestamps[0]
    @property
    def end_time(self):
        return self._timestamps[-1]
    @property
    def type(self) -> Union[Literal['continuous'], Literal['discrete']]:
        return self._type
    def get_samples(self, start: float, end: float, channel_inds: Union[List[int], range]):
        x = np.where((start <= self._timestamps) & (self._timestamps < end))[0]
        return (self._timestamps[x], self._values[x][:, channel_inds])
    @property
    def sampling_frequency(self):
        return self._sampling_frequency
