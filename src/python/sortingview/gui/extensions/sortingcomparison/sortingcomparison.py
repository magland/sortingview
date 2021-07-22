import kachery_client as kc
import hither2 as hi
from sortingview.config import job_cache, job_handler
from sortingview.extractors import LabboxEphysRecordingExtractor, LabboxEphysSortingExtractor

@hi.function(
    'get_best_matching_units', '0.1.2',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['sortingview']
)
def get_best_matching_units(*, sorting_object, compare_sorting_object, sorting_selector, recording_object):
    import spikecomparison as sc
    S = LabboxEphysSortingExtractor(sorting_object)
    S_compare = LabboxEphysSortingExtractor(compare_sorting_object)
    R = LabboxEphysRecordingExtractor(recording_object)
    C = sc.compare_sorter_to_ground_truth(gt_sorting=S, tested_sorting=S_compare)
    if sorting_selector == 'A':
        s = 'B'
    elif sorting_selector == 'B':
        s = 'A'
    else:
        s = ''
    ret = {}
    for id in S.get_unit_ids():
        ret[str(id)] = f'{C.best_match_12[id]}{s}'
    return ret
    


@kc.taskfunction('get_best_matching_units.2', type='pure-calculation')
def task_get_best_matching_units(*, sorting_object, compare_sorting_object, sorting_selector, recording_object, configuration={}, snippet_len=(50, 80)):
    with hi.Config(
        job_cache=job_cache,
        job_handler=job_handler.metrics
    ):
        return get_best_matching_units.run(
            sorting_object=sorting_object,
            compare_sorting_object=compare_sorting_object,
            sorting_selector=sorting_selector,
            recording_object=recording_object
        )