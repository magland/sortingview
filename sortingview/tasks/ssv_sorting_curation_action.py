import kachery_client as kc
from ._verify_oauth2_token import _verify_oauth2_token

@kc.taskfunction('spikesortingview.sorting_curation_action.1', type='action')
def task_spikesortingview_sorting_curation_action(sorting_curation_uri: str, action: dict, user_id: str, google_id_token: str):
    id_info = _verify_oauth2_token(google_id_token.encode('utf-8'))
    auth_user_id = id_info['email']
    assert auth_user_id == user_id

    if not _check_sorting_curation_authorization(sorting_curation_uri, user_id):
        raise Exception('Not authorized')

    curation_subfeed = kc.load_subfeed(sorting_curation_uri)
    curation_subfeed.append_message(action)

@kc.taskfunction('spikesortingview.check_sorting_curation_authorized.1', type='query')
def task_spikesortingview_check_sorting_curation_authorized(sorting_curation_uri: str, user_id: str, google_id_token: str):
    id_info = _verify_oauth2_token(google_id_token.encode('utf-8'))
    auth_user_id = id_info['email']
    assert auth_user_id == user_id

    return {
        'authorized': _check_sorting_curation_authorization(sorting_curation_uri, user_id)
    }

def _check_sorting_curation_authorization(sorting_curation_uri: str, user_id: str):
    key = {
        'type': 'spikesortingview_sorting_curation_authorized_users',
        'sorting_curation_uri': sorting_curation_uri
    }
    a = kc.get(key)
    if a is None:
        return False
    return (user_id in a)