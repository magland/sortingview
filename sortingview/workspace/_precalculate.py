import os
import kachery_client as kc
from .workspace import Workspace
from ..tasks.preload_extract_snippets import task_preload_extract_snippets
from sortingview.helpers import prepare_snippets_h5
from sortingview.config import job_handler

def _precalculate(workspace: Workspace, _debug: bool=False):
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
        
        if not _debug:
            old_job_handler = job_handler.extract_snippets
            job_handler.extract_snippets = None
            kc._run_task(
                task_preload_extract_snippets,
                kwargs,
                channel=FIGURL_CHANNEL
            )
            job_handler.extract_snippets = old_job_handler
        else:
            # for debugging
            prepare_snippets_h5(
                **kwargs
            )


def _precalculate_debug(workspace: Workspace):
    _precalculate(workspace=workspace, _debug=True)