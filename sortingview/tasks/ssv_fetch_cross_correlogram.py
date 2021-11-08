import kachery_client as kc
import hither2 as hi
from sortingview.config import job_cache, job_handler
from ..experimental.SpikeSortingView import SpikeSortingView
from ..experimental.SpikeSortingView.helpers.compute_correlogram_data import compute_correlogram_data
from sortingview.serialize_wrapper import serialize_wrapper


@hi.function(
    'spikesortingview_fetch_cross_correlogram', '0.1.2'
)
@serialize_wrapper
def spikesortingview_fetch_cross_correlogram(*, data_uri: str, unit_id1: int, unit_id2: int):
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

@kc.taskfunction('spikesortingview.fetch_cross_correlogram.2', type='pure-calculation')
def task_spikesortingview_fetch_cross_correlogram(*, data_uri: str, unit_id1: int, unit_id2: int):
    with hi.Config(job_handler=job_handler.correlograms, job_cache=job_cache):
        return hi.Job(spikesortingview_fetch_cross_correlogram, {'data_uri': data_uri, 'unit_id1': unit_id1, 'unit_id2': unit_id2})