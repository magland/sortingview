import kachery_client as kc
from ..workspace_list import WorkspaceList

@kc.taskfunction('sortingview_workspace_list_subfeed.2', type='query')
def task_sortingview_workspace_list_subfeed(name: str):
    W = WorkspaceList(list_name=name)
    return W.get_subfeed_uri()