import kachery_client as kc
from ..workspace import load_workspace

@kc.taskfunction('workspace_action.1', type='action')
def task_workspace_action(workspace_uri: str, action: dict):
    W = load_workspace(workspace_uri)
    W._append_action(action)