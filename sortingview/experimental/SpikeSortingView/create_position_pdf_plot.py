from typing import List, Union
import numpy as np
from .Figure import Figure

def create_position_pdf_plot(*, start_time_sec: np.float32, sampling_frequency: np.float32, pdf: np.ndarray, label: str):
    Nt = pdf.shape[0]
    Np = pdf.shape[1]

    data = {
        'type': 'PositionPdfPlot',
        'pdf': pdf.astype(np.float32),
        'samplingFrequency': sampling_frequency,
        'startTimeSec': start_time_sec
    }
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
