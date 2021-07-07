import hither2 as hi
from labbox_ephys import prepare_snippets_h5
from sortingview.config import job_cache, job_handler
import kachery_client as kc

# @hi.function('preload_extract_snippets', '0.1.0')
# def preload_extract_snippets(recording_object, sorting_object, snippet_len=(50, 80)):
#     from labbox_ephys import prepare_snippets_h5
#     snippets_h5 = prepare_snippets_h5(recording_object=recording_object, sorting_object=sorting_object, snippet_len=snippet_len)
#     return snippets_h5

@kc.taskfunction('preload_extract_snippets.2', type='pure-calculation')
def task_preload_extract_snippets(recording_object, sorting_object, snippet_len=(50, 80)):
    with hi.Config(job_handler=job_handler.waveforms, job_cache=job_cache):
        with hi.Config(job_handler=job_handler.extract_snippets):
            snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object, snippet_len=snippet_len)
        return snippets_h5