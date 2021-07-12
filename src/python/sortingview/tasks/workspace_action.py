import kachery_client as kc
from ..workspace import load_workspace

@kc.taskfunction('sortingview_workspace_action.1', type='action')
def task_sortingview_workspace_action(workspace_uri: str, action: dict):
    W = load_workspace(workspace_uri)
    W._append_action(action)