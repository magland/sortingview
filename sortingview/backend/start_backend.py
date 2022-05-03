import json
from typing import List, Union
from kachery_cloud.TaskBackend import TaskBackend
import kachery_cloud as kcl
from ..SpikeSortingView import SpikeSortingView
from .compute_correlogram_data import compute_correlogram_data
from ._verify_oauth2_token import _verify_oauth2_token


def fetch_cross_correlogram(*, data_uri: str, unit_id1: int, unit_id2: int):
    X = SpikeSortingView(data_uri)
    times1 = X.get_unit_spike_train(unit_id=unit_id1)
    times2 = X.get_unit_spike_train(unit_id=unit_id2)
    if unit_id1 == unit_id2:
        times2 = None
    a = compute_correlogram_data(times1=times1, times2=times2, sampling_frequency=X.sampling_frequency, window_size_msec=50, bin_size_msec=1)
    bin_edges_sec = a['bin_edges_sec']
    bin_counts = a['bin_counts']
    return {
        'binEdgesSec': bin_edges_sec,
        'binCounts': bin_counts
    }

def sorting_curation_action(*, sorting_curation_uri: str, action: dict, user_id: str, google_id_token: str):
    id_info = _verify_oauth2_token(google_id_token.encode('utf-8'))
    auth_user_id = id_info['email']
    assert auth_user_id == user_id

    if not _check_sorting_curation_authorization(sorting_curation_uri, user_id):
        raise Exception('Not authorized')

    curation_feed = kcl.Feed.load(sorting_curation_uri)
    curation_feed.append_message(action)

def _check_sorting_curation_authorization(sorting_curation_uri: str, user_id: str):
    a = kcl.get_mutable(f'sortingview/sortingCurationAuthorizedUsers/{sorting_curation_uri}')
    if a is None:
        return False
    b: List[str] = json.loads(a)
    return user_id in b

def start_backend(*, project_id: str, backend_id: Union[str, None]=None):
    X = TaskBackend(project_id=project_id)
    X.register_task_handler(
        task_type='calculation',
        task_name='spikesortingview.fetch_cross_correlogram.2',
        task_function=fetch_cross_correlogram
    )
    X.register_task_handler(
        task_type='action',
        task_name='spikesortingview.sorting_curation_action.1',
        task_function=sorting_curation_action
    )
    X.run()