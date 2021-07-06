import os
import hither2 as hi
import kachery_client as kc
from sortingview.config import job_cache, job_handler

@hi.function(
    'get_firing_data', '0.1.2',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['labbox_ephys']
)
def get_firing_data(sorting_object, recording_object, configuration={}, snippet_len=(50, 80)):
    from decimal import Decimal
    S, R = get_structure(sorting_object, recording_object)
    elapsed = R.get_num_frames()/R.get_sampling_frequency()
    ids = S.get_unit_ids()
    train = [S.get_unit_spike_train(id).size for id in ids]
    keyedCount = dict(zip(
        [str(id) for id in ids],
        [{'count': t,
          'rate': f"{Decimal(t / elapsed).quantize(Decimal('.01'))}"} for t in train]))
    return keyedCount

@kc.taskfunction('get_firing_data.1', type='pure-calculation')
def task_get_firing_data(sorting_object, recording_object, configuration={}, snippet_len=(50, 80)):
    with hi.Config(
        job_cache=job_cache,
        job_handler=job_handler.metrics
    ):
        return get_firing_data.run(
            sorting_object=sorting_object,
            recording_object=recording_object,
            configuration=configuration
        )


def get_structure(sorting_object, recording_object):
    import labbox_ephys as le
    S = le.LabboxEphysSortingExtractor(sorting_object)
    R = le.LabboxEphysRecordingExtractor(recording_object)
    return S, R

