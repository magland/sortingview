from typing import List, Union
import numpy as np
from .Figure import Figure

def create_position_pdf_plot(*, time_coord: np.array, position_coord: np.array, pdf: np.ndarray, start_time_sec: float, end_time_sec: float, sampling_frequency: Union[float, None], label: str):
    Nt = len(time_coord)
    Np = len(position_coord)
    assert pdf.shape[0] == Nt
    assert pdf.shape[1] == Np
    
    if sampling_frequency is not None:
        inds = _get_subsample_inds(time_coord, sampling_frequency)
        time_coord = time_coord[inds]
        pdf = pdf[inds, :]
    data = {
        'type': 'PositionPdfPlot',
        'timeCoord': time_coord.astype(np.float32),
        'positionCoord': position_coord.astype(np.float32),
        'pdf': pdf.astype(np.float32),
        'startTimeSec': start_time_sec,
        'endTimeSec': end_time_sec
    }
    return Figure(
        data=data,
        label=label
    )

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
