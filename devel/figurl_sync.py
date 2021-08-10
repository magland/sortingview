from typing import List, Union
import kachery_client as kc
import sortingview.figurl as fig

def figurl_average_waveforms(*,
        recording_id: str,
        sorting_id: str,
        workspace_uri: str,
        unit_ids: List[int],
        selected_unit_ids: Union[fig.Sync, None]=None
    ):
    """
    Generate a sortingview url that shows the average waveforms page
    """
    data = {
        'workspaceUri': workspace_uri,
        'recordingId': recording_id,
        'sortingId': sorting_id,
        'unitIds': unit_ids
    }
    if selected_unit_ids is not None:
        data['selectedUnitIds'] = selected_unit_ids
    return fig.Figure(type='sortingview.average-waveforms.1', data=data)

sync_selected_unit_ids_1 = fig.Sync()

F1 = figurl_average_waveforms(
    recording_id='R-fa746904d460',
    sorting_id='S-83c498c391ed',
    workspace_uri='workspace://acf9d87b54e5daefbf1a6797bdaf5e1faee4834372e6704bdfdd78ed34353ca3',
    unit_ids=[1, 2, 3, 4],
    selected_unit_ids=sync_selected_unit_ids_1
)
F2 = figurl_average_waveforms(
    recording_id='R-fa746904d460',
    sorting_id='S-83c498c391ed',
    workspace_uri='workspace://acf9d87b54e5daefbf1a6797bdaf5e1faee4834372e6704bdfdd78ed34353ca3',
    unit_ids=[1, 2, 3, 4],
    selected_unit_ids=sync_selected_unit_ids_1
)

F = fig.BoxLayout([F1, F2])
url = F.url()

print(url)
