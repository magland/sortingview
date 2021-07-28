import kachery_client as kc

from ..workspace_list import get_workspace_list, set_workspace_list

@kc.taskfunction('sortingview.get_workspace_list.1', type='query')
def task_get_workspace_list(name: str):
    workspace_list = get_workspace_list(name=name)
    return workspace_list