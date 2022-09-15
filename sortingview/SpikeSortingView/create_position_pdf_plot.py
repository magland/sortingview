from typing import List, Union
import numpy as np
# from .Figure import Figure
from ..views.View import View
from kachery_cloud._serialize import _serialize

def create_position_pdf_plot(*, start_time_sec: np.float32, sampling_frequency: np.float32, pdf: np.ndarray, label: str):
    # Nt = pdf.shape[0]
    # Np = pdf.shape[1]

    A = pdf
    B = A / np.reshape(np.repeat(np.max(A, axis=1), A.shape[1]), A.shape)
    B = (B * 100).astype(np.uint8)

    data = {
        'type': 'PositionPdfPlot',
        'pdf': B,
        'samplingFrequency': sampling_frequency,
        'startTimeSec': start_time_sec
    }
    return PositionPdfPlot(data=data)
    # return Figure(
    #     data=data,
    #     label=label
    # )

def create_live_position_pdf_plot(*, start_time_sec: np.float32, end_time_sec: np.float32, sampling_frequency: np.float32, num_positions: int, pdf_object: dict, segment_size: int, multiscale_factor: int, label: str, linear_positions: Union[np.array, None]=None):
    data = {
        'type': 'LivePositionPdfPlot',
        'pdfObject': pdf_object,
        'startTimeSec': start_time_sec,
        'endTimeSec': end_time_sec,
        'numPositions': num_positions,
        'samplingFrequency': sampling_frequency,
        'segmentSize': segment_size,
        'multiscaleFactor': multiscale_factor
    }
    if linear_positions is not None:
        data['linearPositions'] = linear_positions
    return LivePositionPdfPlot(data=data)
    # return Figure(
    #     data=data,
    #     label=label
    # )

class PositionPdfPlot(View):
    def __init__(self, *,
        data: dict,
        **kwargs
    ) -> None:
        super().__init__('PositionPdfPlot', **kwargs)
        self._data = data
        self._serialized_data = _serialize(self._data, compress_npy=True)
    def to_dict(self) -> dict:
        return self._data
    def register_task_handlers(self, task_backend):
        pass
    def child_views(self) -> List[View]:
        return []
    @property
    def data(self):
        return self._data
    @property
    def label(self):
        return 'no-label'
    def get_serialized_figure_data(self):
        return self._serialized_data

class LivePositionPdfPlot(View):
    def __init__(self, *,
        data: dict,
        **kwargs
    ) -> None:
        super().__init__('LivePositionPdfPlot', **kwargs)
        self._data = data
        self._serialized_data = _serialize(self._data, compress_npy=True)
    def to_dict(self) -> dict:
        return self._data
    def register_task_handlers(self, task_backend):
        pass
    def child_views(self) -> List[View]:
        return []
    @property
    def data(self):
        return self._data
    @property
    def label(self):
        return 'no-label'
    def get_serialized_figure_data(self):
        return self._serialized_data

# def _get_subsample_inds(timestamps: np.array, sampling_frequency: float):
#     dt = 1 / sampling_frequency
#     ret = []
#     last_t = timestamps[0] - dt * 2
#     for i in range(len(timestamps)):
#         delta = timestamps[i] - last_t
#         if delta >= dt * 0.95:
#             ret.append(i)
#             last_t = timestamps[i]
#     return ret
