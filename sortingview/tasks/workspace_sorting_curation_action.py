import kachery_client as kc
from ..workspace import load_workspace

@kc.taskfunction('sortingview_workspace_sorting_curation_action.1', type='action')
def task_sortingview_workspace_sorting_curation_action(workspace_uri: str, sorting_id: str, action: dict):
    W = load_workspace(workspace_uri)
    f = W.feed
    curation_subfeed = f.load_subfeed({'name': 'sortingCuration', 'sortingId': sorting_id})
    curation_subfeed.append_message(action)
    
    