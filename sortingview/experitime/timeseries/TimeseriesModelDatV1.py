from time import time
from typing import Dict, List, Literal, Union
import kachery_client as kc
import numpy as np
from numpy.core.numeric import Infinity

class TimeseriesModelDatV1:
    def __init__(self, *, channel_names: List[str], num_samples: int, timestamps_uri: str, timestamps_dtype: str, values_uris: List[str], values_dtype: str, channel_properties: Union[Dict[str, dict], None]=None, sampling_frequency: float, type: Union[Literal['continuous'], Literal['discrete']]):
        self._channel_names = channel_names
        self._channel_properties = channel_properties
        self._timestamps = _load_timestamps_from_uri(timestamps_uri, dtype=timestamps_dtype)
        assert len(self._timestamps) == num_samples, 'Mismatch between num_samples and length of timestamps'
        self._num_channels = len(channel_names)
        self._values: List[np.ndarray] = [
            _load_values_from_uri(values_uris[i], dtype=values_dtype)
            for i in range(self._num_channels)
        ]
        self._type: Union[Literal['continuous'], Literal['discrete']] = type
        self._sampling_frequency = sampling_frequency
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
        ret = np.zeros((len(x), len(channel_inds)), dtype=self._values[0].dtype)
        print(self._values[0].shape, self._timestamps.shape)
        for i, channel_ind in enumerate(channel_inds):
            ret[:, i] = self._values[channel_ind][x]
        return self._timestamps[x], ret
    @property
    def sampling_frequency(self):
        return self._sampling_frequency

def _load_timestamps_from_uri(uri: str, *, dtype: str):
    if dtype == 'float32':
        d = np.float32
    elif dtype == 'float64':
        d = np.float64
    else:
        raise Exception(f'Unexpected dtype for loading timestamps: {dtype}')
    local_fname = kc.load_file(uri)
    if local_fname is None:
        raise Exception(f'Unable to load timestamps: {uri}')
    return np.fromfile(local_fname, dtype=d)

def _load_values_from_uri(uri: str, *, dtype: str):
    if dtype == 'float32':
        d = np.float32
    elif dtype == 'int16':
        d = np.int16
    else:
        raise Exception(f'Unexpected dtype for loading values: {dtype}')
    local_fname = kc.load_file(uri)
    if local_fname is None:
        raise Exception(f'Unable to load values: {uri}')
    return np.fromfile(local_fname, dtype=d)