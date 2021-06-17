from typing import List, cast
import hither2 as hi
import labbox_ephys as le
import numpy as np
import spikeextractors as se
import kachery_client as kc
from sortingview.config import job_cache, job_handler

@hi.function(
    'sorting_info', '0.1.3'
)
def sorting_info(sorting_uri):
    sorting = le.LabboxEphysSortingExtractor(sorting_uri)
    return dict(
        unit_ids=_to_int_list(sorting.get_unit_ids()),
        samplerate=sorting.get_sampling_frequency(),
        sorting_object=sorting.object()
    )

@kc.taskfunction('sorting_info.3', type='pure-calculation')
def task_sorting_info(sorting_uri: str):
    with hi.Config(job_handler=job_handler.misc, job_cache=job_cache):
        return hi.Job(sorting_info, {'sorting_uri': sorting_uri})


def _to_int_list(x):
    return np.array(x).astype(int).tolist()