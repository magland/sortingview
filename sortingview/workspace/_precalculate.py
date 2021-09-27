import os
import kachery_client as kc
from .workspace import Workspace
from ..tasks.preload_extract_snippets import task_preload_extract_snippets
from sortingview.helpers import prepare_snippets_h5

def _precalculate(workspace: Workspace):
    FIGURL_CHANNEL = os.getenv('FIGURL_CHANNEL')
    if FIGURL_CHANNEL is None:
        raise Exception('Environment variable not set: FIGURL_CHANNEL')
    for sorting_id in workspace.sorting_ids:
        sorting = workspace.get_sorting(sorting_id)
        sorting_id = sorting['sortingId']
        sorting_label = sorting['sortingLabel']
        sorting_object = sorting['sortingObject']
        recording_id = sorting['recordingId']
        recording_object = sorting['recordingObject']
        recording = workspace.get_recording(recording_id)
        recording_label = recording['recordingLabel']

        print(f'Precalculating: {recording_label}/{sorting_label}')
        kwargs = {
            'recording_object': recording_object,
            'sorting_object': sorting_object
        }
        if workspace.snippet_len != (50, 80):
            # important to only add this kwarg if not the default
            kwargs['snippet_len'] = workspace.snippet_len
        kc._run_task(
            task_preload_extract_snippets,
            kwargs,
            channel=FIGURL_CHANNEL
        )

def _precalculate_debug(workspace: Workspace):
    for sorting_id in workspace.sorting_ids:
        sorting = workspace.get_sorting(sorting_id)
        sorting_id = sorting['sortingId']
        sorting_label = sorting['sortingLabel']
        sorting_object = sorting['sortingObject']
        recording_id = sorting['recordingId']
        recording_object = sorting['recordingObject']
        recording = workspace.get_recording(recording_id)
        recording_label = recording['recordingLabel']

        print(f'Precalculating (debug): {recording_label}/{sorting_label}')
        kwargs = {
            'recording_object': recording_object,
            'sorting_object': sorting_object
        }
        if workspace.snippet_len != (50, 80):
            # important to only add this kwarg if not the default
            kwargs['snippet_len'] = workspace.snippet_len
        
        prepare_snippets_h5(
            **kwargs
        )