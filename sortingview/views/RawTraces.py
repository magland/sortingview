from typing import List
import numpy as np
from .View import View
import figurl as fig
import kachery_cloud as kcl


class RawTraces(View):
    """
    Raw traces view
    """
    def __init__(self, *,
        start_time_sec: float,
        sampling_frequency: float,
        traces: np.ndarray,
        channel_ids: np.array,
        **kwargs
    ) -> None:
        super().__init__('RawTraces', **kwargs)
        self._start_time_sec = start_time_sec
        self._sampling_frequency = sampling_frequency
        self._traces = traces
        if isinstance(channel_ids, np.ndarray):
            channel_ids = channel_ids.astype(np.int32)
        self._channel_ids = channel_ids
    def to_dict(self) -> dict:
        N = self._traces.shape[0]
        M = self._traces.shape[1]
        chunk_size = int(np.floor(1e6 / M))
        ds_factor = 1
        chunks = {}
        while True:
            num_chunks = int(np.ceil(N / (chunk_size * ds_factor)))
            for i in range(num_chunks):
                print(f'Preparing {ds_factor} {i + 1}/{num_chunks}')
                X = self._traces[i * chunk_size * ds_factor:(i + 1) * chunk_size * ds_factor, :]
                if ds_factor == 1:
                    Y = X
                    uri = kcl.store_json(fig.serialize_data(Y))
                    chunks[f'{ds_factor}-{i}'] = uri
                else:
                    N2 = int(np.floor(X.shape[0] / ds_factor))
                    A = X[:N2 * ds_factor].reshape((N2, ds_factor, M))
                    Y_min = np.min(A, axis=1)
                    Y_max = np.max(A, axis=1)
                    uri_min = kcl.store_json(fig.serialize_data(Y_min))
                    uri_max = kcl.store_json(fig.serialize_data(Y_max))
                    chunks[f'{ds_factor}-{i}'] = {
                        'min': uri_min,
                        'max': uri_max
                    }
            if num_chunks == 1:
                break
            ds_factor = ds_factor * 3
        ret = {
            'type': self.type,
            'startTimeSec': self._start_time_sec,
            'samplingFrequency': self._sampling_frequency,
            'chunkSize': chunk_size,
            'numFrames': N,
            'tracesChunks': chunks,
            'channelIds': self._channel_ids
        }
        return ret
    def child_views(self) -> List[View]:
        return []
