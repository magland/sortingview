import numpy as np
from typing import Any, List
import kachery_client as kc
from sortingview.serialize_wrapper import _serialize

def store_json(x: dict):
    return kc.store_json(_serialize(x))

def figurl_average_waveforms_numpy(*, channel: str, waveforms: List[Any], electrode_channels: List[Any]):
    """
    Generate a sortingview url that shows the average waveforms numpy page
    """
    base_url = 'http://localhost:3000'
    object_uri = store_json({
        'type': 'sortingview.average-waveforms-numpy.1',
        'data': {
            'waveforms': waveforms,
            'electrodeChannels': electrode_channels
        }
    })
    object_hash = object_uri.split('/')[2]
    url = f'{base_url}/fig?channel={channel}&figureObject={object_hash}'
    return url

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
    channel='ccm',
    waveforms=waveforms,
    electrode_channels=electrode_channels
)
print(url)
