from typing import List, Union
import numpy as np
from .Figure import Figure

def create_raw_traces_plot(*, start_time_sec: float, sampling_frequency: float, traces: np.array, label: str):
    data = {
        'type': 'RawTracesPlot',
        'startTimeSec': start_time_sec,
        'samplingFrequency': sampling_frequency,
        'traces': traces
    }
    return Figure(data=data, label=label)