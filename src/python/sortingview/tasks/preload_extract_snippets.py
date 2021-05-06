import hither2 as hi
from .job_handler import job_handler
from .job_cache import job_cache
from ..backend import taskfunction

@hi.function('preload_extract_snippets', '0.1.0')
def preload_extract_snippets(recording_object, sorting_object):
    from labbox_ephys import prepare_snippets_h5
    snippets_h5 = prepare_snippets_h5(recording_object=recording_object, sorting_object=sorting_object)
    return snippets_h5

@taskfunction('preload_extract_snippets.1')
def task_preload_extract_snippets(recording_object, sorting_object):
    with hi.Config(job_handler=job_handler, job_cache=job_cache):
        return hi.Job(preload_extract_snippets, {'recording_object': recording_object, 'sorting_object': sorting_object})