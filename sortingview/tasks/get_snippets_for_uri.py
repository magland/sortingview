import kachery_client as kc
from sortingview.serialize_wrapper import serialize_wrapper

@kc.taskfunction('sortingview.get_snippets_for_uri.1', type='pure-calculation')
@serialize_wrapper
def task_get_snippets_for_uri(snippets_uri: str):
    return kc.load_npy(snippets_uri)

@kc.taskfunction('sortingview.get_timestamps_for_uri.1', type='pure-calculation')
@serialize_wrapper
def task_get_timestamps_for_uri(timestamps_uri: str):
    return kc.load_npy(timestamps_uri)

@kc.taskfunction('sortingview.get_features_for_uri.1', type='pure-calculation')
@serialize_wrapper
def task_get_features_for_uri(features_uri: str):
    return kc.load_npy(features_uri)