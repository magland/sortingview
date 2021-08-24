from os import stat
from typing import Any, List, Literal, Union, cast
from .TimeseriesModelDatV1 import TimeseriesModelDatV1
from .TimeseriesModelNwbV1 import TimeseriesModelNwbV1
import numpy as np
import kachery_client as kc
from numpy.core.numeric import Infinity
from .TimeseriesModelNpyV1 import TimeseriesModelNpyV1
from figurl import Figure

class Timeseries:
    def __init__(self, arg: Union[dict, str]):
        if isinstance(arg, str):
            x = kc.load_json(arg)
            if not x:
                raise Exception(f'Unable to load: {arg}')
            arg = cast(dict, x)
        self._model = _load_model(arg)
        self._arg = arg
    @property
    def channel_names(self):
        return self._model.channel_names
    @property
    def channel_properties(self):
        return self._model.channel_properties
    @property
    def num_samples(self):
        return self._model.num_samples
    @property
    def num_channels(self):
        return len(self._model.channel_names)
    @property
    def start_time(self):
        return self._model.start_time
    @property
    def end_time(self):
        return self._model.end_time
    @property
    def type(self) -> Union[Literal['continuous'], Literal['discrete']]:
        return self._model.type
    @property
    def object(self):
        return self._arg
    def get_samples(self, start: Union[None, float]=None, end: Union[None, float]=None, channels: Union[None, List[str]]=None):
        if start is None:
            start = -Infinity
        if end is None:
            end = Infinity
        if channels is None:
            channel_inds = range(self.num_channels)
        else:
            channel_inds = [self.channel_names.index(ch) for ch in channels]
        return self._model.get_samples(start=start, end=end, channel_inds=channel_inds)
    @property
    def sampling_frequency(self):
        return self._model.sampling_frequency
    def figurl(self):
        data = {
            'timeseriesUri': kc.store_json(self.object)
        }
        return Figure(type='experitime.timeseries.1', data=data)
    @staticmethod
    def from_numpy(*, channel_names: List[str], timestamps: np.ndarray, values: np.ndarray, type: Union[Literal['continuous'], Literal['discrete']], channel_properties: Union[dict, None]=None):
        num_channels = len(channel_names)
        assert num_channels == values.shape[1]
        if values.dtype == np.float32:
            values_dtype = 'float32'
        elif values.dtype == np.int16:
            values_dtype = 'int16'
        else:
            raise Exception(f'Unsupported dtype for values: {values.dtype}')
        if timestamps.dtype == np.float32:
            timestamps_dtype = 'float32'
        elif timestamps.dtype == np.float64:
            timestamps_dtype = 'float64'
        else:
            raise Exception(f'Unsupported dtype for timestamps: {values.dtype}')
        with kc.TemporaryDirectory() as tmpdir:
            timestamps_fname = f'{tmpdir}/timestamps.dat'
            timestamps.tofile(timestamps_fname)
            values_fnames: List[str] = []
            for i, channel_name in enumerate(channel_names):
                channel_fname = f'{tmpdir}/channel_{channel_name}.dat'
                values[:, i].tofile(channel_fname)
                values_fnames.append(channel_fname)
            return Timeseries({
                'timeseries_format': 'dat_v1',
                'data': {
                    'channel_names': channel_names,
                    'channel_properties': channel_properties,
                    'num_samples': len(timestamps),
                    'timestamps_uri': kc.store_file(timestamps_fname),
                    'timestamps_dtype': timestamps_dtype,
                    'values_uris': [kc.store_file(values_fnames[i]) for i in range(num_channels)],
                    'values_dtype': values_dtype,
                    'sampling_frequency': _estimate_sampling_frequency(timestamps),
                    'type': type
                }
            })

            # return Timeseries({
            #     'timeseries_format': 'npy_v1',
            #     'data': {
            #         'channel_names': channel_names,
            #         'timestamps_uri': kc.store_npy(timestamps),
            #         'values_uri': kc.store_npy(values),
            #         'type': type
            #     }
            # })
    @staticmethod
    def from_spikeinterface_recording(recording: Any):
        R = recording
        channel_names = [str(id) for id in R.get_channel_ids()]
        timestamps = (np.arange(R.get_num_frames()) * 1 / R.get_sampling_frequency()).astype(np.float32)
        values = R.get_traces().T.astype(np.float32)
        channel_properties = {}
        for id in R.get_channel_ids():
            channel_properties[str(id)] = {'location': np.array(R.get_channel_property(id, 'location')).astype(float).tolist()}
        return Timeseries.from_numpy(
            channel_names=channel_names,
            timestamps=timestamps,
            values=values,
            channel_properties=channel_properties,
            type='continuous'
        )
    @staticmethod
    def from_nwb(nwb_uri: str):
        return Timeseries({
            'timeseries_format': 'nwb_v1',
            'data': {
                'nwb_uri': nwb_uri
            }
        })

def _estimate_sampling_frequency(timestamps: np.ndarray):
    if len(timestamps) <= 1:
        return 0
    deltas = np.diff(timestamps)
    median_delta = np.median(deltas)
    deltas_excluding_outliers = deltas[(median_delta * 0.9 < deltas) & (deltas < median_delta * 1.1)]
    return 1 / float(np.mean(deltas_excluding_outliers))

def _load_model(arg: dict):
    format = arg.get('timeseries_format')
    data = arg.get('data', {})
    if format == 'npy_v1':
        return TimeseriesModelNpyV1(
            channel_names=data['channel_names'],
            timestamps_uri=data['timestamps_uri'],
            values_uri=data['values_uri'],
            type=data['type'],
            sampling_frequency=data['sampling_frequency'],
            channel_properties=data['channel_properties']
        )
    elif format == 'dat_v1':
        return TimeseriesModelDatV1(
            channel_names=data['channel_names'],
            num_samples=data['num_samples'],
            timestamps_uri=data['timestamps_uri'],
            timestamps_dtype=data['timestamps_dtype'],
            values_uris=data['values_uris'],
            values_dtype=data['values_dtype'],
            channel_properties=data['channel_properties'],
            sampling_frequency=data['sampling_frequency'],
            type=data.get('type', 'continuous')
        )
    elif format == 'nwb_v1':
        return TimeseriesModelNwbV1(nwb_uri=data['nwb_uri'])
    else:
        raise Exception(f'Unexpected timeseries format: {format}')
