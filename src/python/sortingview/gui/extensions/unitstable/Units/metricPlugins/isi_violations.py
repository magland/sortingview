import hither2 as hi
from sortingview.config import job_cache, job_handler
from sortingview.extractors import LabboxEphysRecordingExtractor, LabboxEphysSortingExtractor
import kachery_client as kc

@hi.function(
    'get_isi_violation_rates', '0.1.1',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['sortingview']
)
def get_isi_violation_rates(sorting_object, recording_object, configuration={}, snippet_len=(50, 80)):
    import spikemetrics as sm
    S = LabboxEphysSortingExtractor(sorting_object)
    R = LabboxEphysRecordingExtractor(recording_object)

    samplerate = R.get_sampling_frequency()
#    duration_sec = R.get_num_frames() / samplerate

    isi_threshold_msec = configuration.get('isi_threshold_msec', 2.5)
    unit_ids = configuration.get('unit_ids', S.get_unit_ids())

    ret = {}
    for id in unit_ids:
        spike_train = S.get_unit_spike_train(unit_id=id)
        ret[str(id)], _ = sm.metrics.isi_violations( #_ is total violations
            spike_train=spike_train,
            duration=R.get_num_frames(),
            isi_threshold=isi_threshold_msec / 1000 * samplerate
        )
    return ret

@kc.taskfunction('get_isi_violation_rates.1', type='pure-calculation')
def task_get_isi_violation_rates(sorting_object, recording_object, configuration={}, snippet_len=(50, 80)):
    with hi.Config(
        job_cache=job_cache,
        job_handler=job_handler.metrics
    ):
        return get_isi_violation_rates.run(
            sorting_object=sorting_object,
            recording_object=recording_object,
            configuration=configuration
        )