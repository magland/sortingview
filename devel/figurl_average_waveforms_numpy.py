import numpy as np
from typing import Any, List
import figurl as fig

def figurl_average_waveforms_numpy(*, waveforms: List[Any], electrode_channels: List[Any]):
    """
    Generate a sortingview figure that shows the average waveforms numpy page
    """
    data = {
        'waveforms': waveforms,
        'electrodeChannels': electrode_channels
    }
    return fig.Figure(type='sortingview.average-waveforms-numpy.1', data=data)

waveforms = [
    {
        'unitId': 1,
        'channelIds': np.array([1, 2, 3, 4], dtype=np.int32),
        'waveform': np.array([
            [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1],
            [1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1],
            [-1, -2, -3, -4, -5, -6, -5, -4, -3, -2, -1],
            [-1, -2, -3, -4, -5, -6, 5, 4, 3, 2, 1]
        ], dtype=np.float32)
    },
    {
        'unitId': 2,
        'channelIds': np.array([1, 2, 3, 4], dtype=np.int32),
        'waveform': np.array([
            [0, 0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 0, 0, 0],
            [0, 0, 0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1, 0, 0, 0],
            [0, 0, 0, -1, -2, -3, -4, -5, -6, -5, -4, -3, -2, -1, 0, 0, 0],
            [0, 0, 0, -1, -2, -3, -4, -5, -6, 5, 4, 3, 2, 1, 0, 0, 0]
        ], dtype=np.float32)
    }
]
electrode_channels = [
    {
        'channelId': 1,
        'location': [0, 0]
    },
    {
        'channelId': 2,
        'location': [10, 0]
    },
    {
        'channelId': 3,
        'location': [20, 0]
    },
    {
        'channelId': 4,
        'location': [30, 0]
    }
]

url = figurl_average_waveforms_numpy(
    waveforms=waveforms,
    electrode_channels=electrode_channels
).url(label='avg waveforms numpy')
print(url)
