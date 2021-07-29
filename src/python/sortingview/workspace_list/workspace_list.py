from typing import Any
import kachery_client as kc
from ..workspace import Workspace

def assert_item_is_valid_workspace_entry(w: Any) -> None:
    if not isinstance(w, dict): raise Exception('Invalid workspace: not a dictionary')
    if not isinstance(w.get('workspaceUri', None), str): raise Exception('Missing or invalid field in workspace: workspaceUri')
    if not isinstance(w.get('label', None), str): raise Exception('Missing or invalid field in workspace: label')
    if not isinstance(w.get('metaData', {}), dict): raise Exception('Invalid field in workspace: metaData')
    for k in w.keys():
        if k not in ['workspaceUri', 'label', 'metaData']:
            raise Exception(f'Invalid field in workspace: {k}')

def get_workspace_list(name: str='default'):
    x = kc.get({'type': 'sortingview-workspace-list', 'name': name})
    if x is None: x = []
    return x

def set_workspace_list(workspace_list, *, name: str='default'):
    if not isinstance(workspace_list, list): raise Exception('Not a list')
    map(assert_item_is_valid_workspace_entry, workspace_list)
    kc.set({'type': 'sortingview-workspace-list', 'name': name}, workspace_list)

def add_workspace_to_list(*, list_name: str='default', workspace: Workspace, meta_data: Any={}):
    x = get_workspace_list(name=list_name)
    x.append({
        'workspaceUri': workspace.uri,
        'label': workspace.label,
        'metaData': meta_data
    })
    set_workspace_list(x)

# TODO: remove workspace from list