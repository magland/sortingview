from typing import List
import kachery_client as kc

def figurl_average_waveforms(*, channel: str, recording_id: str, sorting_id: str, workspace_uri: str, unit_ids: List[int]):
    """
    Generate a sortingview url that shows the average waveforms page
    """
    base_url = 'http://localhost:3000'
    object_uri = kc.store_json({
        'type': 'sortingview.average-waveforms.1',
        'data': {
            'workspaceUri': workspace_uri,
            'recordingId': recording_id,
            'sortingId': sorting_id,
            'unitIds': [1, 2, 3, 4]
        }
    })
    object_hash = object_uri.split('/')[2]
    url = f'{base_url}/fig?channel={channel}&figureObject={object_hash}'
    return url

url = figurl_average_waveforms(
    channel='ccm',
    recording_id='R-fa746904d460',
    sorting_id='S-83c498c391ed',
    workspace_uri='workspace://acf9d87b54e5daefbf1a6797bdaf5e1faee4834372e6704bdfdd78ed34353ca3',
    unit_ids=[1, 2, 3, 4]
)
print(url)
