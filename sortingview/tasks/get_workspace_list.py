import os
from typing import Union
import kachery_client as kc
import yaml

from ..workspace_list import get_workspace_list, set_workspace_list
from ._verify_oauth2_token import _verify_oauth2_token

auth_config_path = os.getenv('SORTINGVIEW_AUTH_CONFIG', None)
if auth_config_path is not None:
    print(f'Using auth config file: {auth_config_path}')
    with open(auth_config_path, 'r') as f:
        auth_config = yaml.safe_load(f)
else:
    print('Using default auth config. To override, set SORTINGVIEW_AUTH_CONFIG to path of a yaml file.')
    auth_config = {}

workspace_lists_auth_config = auth_config.get('workspaceLists', None)

# @kc.taskfunction('sortingview.get_workspace_list.1', type='query')
def task_get_workspace_list(name: str, id_token: Union[str, None]=None):
    if id_token is not None:
        id_info = _verify_oauth2_token(id_token.encode('utf-8'))
        auth_user_id = id_info['email']
    else:
        auth_user_id = None
    if workspace_lists_auth_config is not None:
        if auth_user_id is None: raise Exception('Not authorized (not logged in)')
        ok = False
        for list_name, c in workspace_lists_auth_config.items():
            if list_name == name:
                for x in c:
                    if x['userId'] == auth_user_id:
                        ok = True
    else:
        ok = True
    if not ok: raise Exception('Not authorized')
    workspace_list = get_workspace_list(name=name)
    return workspace_list