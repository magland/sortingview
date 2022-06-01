from typing import Any, List, Tuple, Union
import numpy as np
from .Figure import Figure

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
    return Figure(
        data=data,
        label=label
    )

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
    return Figure(
        data=data,
        label=label
    )

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
