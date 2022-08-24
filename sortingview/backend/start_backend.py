import json
from typing import List, Union
import numpy as np
import h5py
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
    sorting_curation_feed_id = sorting_curation_uri.split('/')[2]
    a = kcl.get_mutable(f'@sortingview/@sortingCurationAuthorizedUsers/{sorting_curation_feed_id}')
    if a is None:
        return False
    b: List[str] = json.loads(a)
    return user_id in b

def fetch_position_pdf_segment(*, pdf_object: dict, segment_number: int, downsample_factor: int):
    format0 = pdf_object['format']
    if format0 == 'position_pdf_h5_v1':
        uri = pdf_object['uri']
        fname = kcl.load_file(uri)
        assert fname is not None
        with h5py.File(fname, 'r') as f:
            return np.array(f.get(f'segment/{downsample_factor}/{segment_number}'))
    else:
        raise Exception(f'Unexpected format: {format0}')

def start_backend(*, project_id: Union[str, None], backend_id: Union[str, None]=None):
    X = TaskBackend(project_id=project_id)
    X.register_task_handler(
        task_type='calculation',
        task_name='spikesortingview.fetch_cross_correlogram.2',
        task_function=fetch_cross_correlogram
    )
    X.register_task_handler(
        task_type='calculation',
        task_name='spikesortingview.fetch_position_pdf_segment.1',
        task_function=fetch_position_pdf_segment
    )
    X.register_task_handler(
        task_type='action',
        task_name='spikesortingview.sorting_curation_action.1',
        task_function=sorting_curation_action
    )
    X.run()