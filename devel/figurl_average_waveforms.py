from typing import List
import kachery_client as kc
import figurl as fig

def figurl_average_waveforms(*, recording_id: str, sorting_id: str, workspace_uri: str, unit_ids: List[int]):
    """
    Generate a sortingview url that shows the average waveforms page
    """
    data = {
        'workspaceUri': workspace_uri,
        'recordingId': recording_id,
        'sortingId': sorting_id,
        'unitIds': [1, 2, 3, 4]
    }
    return fig.Figure(type='sortingview.average-waveforms.1', data=data)

url = figurl_average_waveforms(
    recording_id='R-fa746904d460',
    sorting_id='S-83c498c391ed',
    workspace_uri='workspace://acf9d87b54e5daefbf1a6797bdaf5e1faee4834372e6704bdfdd78ed34353ca3',
    unit_ids=[1, 2, 3, 4]
).url(label='avg waveforms')
print(url)
