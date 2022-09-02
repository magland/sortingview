from typing import List
import numpy as np
from .View import View
import spikeinterface as si
from kachery_cloud.TaskBackend import TaskBackend


class LiveTraces(View):
    """
    Live traces view
    """
    def __init__(self, *,
        recording: si.BaseRecording,
        recording_id: str,
        **kwargs
    ) -> None:
        super().__init__('LiveTraces', **kwargs)
        self._recording = recording
        self._recording_id = recording_id
        M = self._recording.get_num_channels()
        self._chunk_size = int(np.floor(1e6 / M))
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'startTimeSec': 0,
            'samplingFrequency': self._recording.get_sampling_frequency(),
            'chunkSize': self._chunk_size,
            'numFrames': self._recording.get_num_frames(),
            'tracesId': self._recording_id,
            'channelIds': list(self._recording.get_channel_ids())
        }
        return ret
    def register_task_handlers(self, task_backend: TaskBackend):
        task_backend.register_task_handler(
            task_type='calculation',
            task_name=f'getLiveTraces.4.{self._recording_id}',
            extra_kwargs={'recording': self._recording, 'chunk_size': self._chunk_size},
            task_function=get_live_traces,
            can_pickle=False
        )
    def child_views(self) -> List[View]:
        return []

def get_live_traces(recording: si.BaseRecording, chunk_size: int, ds: int, i: int):
    M = recording.get_num_channels()
    recording = recording
    chunk_size = chunk_size
    X = recording.get_traces(0, i * chunk_size * ds, np.minimum((i + 1) * chunk_size * ds, recording.get_num_frames()))
    if ds == 1:
        return X
    else:
        N2 = int(np.floor(X.shape[0] / ds))
        A = X[:N2 * ds].reshape((N2, ds, M))
        Y_min = np.min(A, axis=1)
        Y_max = np.max(A, axis=1)
        return {
            'min': Y_min,
            'max': Y_max
        }