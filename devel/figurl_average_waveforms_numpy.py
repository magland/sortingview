from typing import Any, List
import kachery_client as kc

def figurl_average_waveforms_numpy(*, channel: str, waveforms: List[Any], electrode_channels: List[Any]):
    """
    Generate a sortingview url that shows the average waveforms numpy page
    """
    base_url = 'http://localhost:3000'
    object_uri = kc.store_json({
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
        'channelIds': [1, 2, 3, 4],
        'waveform': [
            [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1],
            [1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1],
            [-1, -2, -3, -4, -5, -6, -5, -4, -3, -2, -1],
            [-1, -2, -3, -4, -5, -6, 5, 4, 3, 2, 1]
        ]
    },
    {
        'unitId': 2,
        'channelIds': [1, 2, 3, 4],
        'waveform': [
            [0, 0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 0, 0, 0],
            [0, 0, 0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1, 0, 0, 0],
            [0, 0, 0, -1, -2, -3, -4, -5, -6, -5, -4, -3, -2, -1, 0, 0, 0],
            [0, 0, 0, -1, -2, -3, -4, -5, -6, 5, 4, 3, 2, 1, 0, 0, 0]
        ]
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
