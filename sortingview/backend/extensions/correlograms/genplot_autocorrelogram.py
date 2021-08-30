import kachery_client as kc
import hither2 as hi
import numpy as np
from sortingview.extractors.h5extractors.h5sortingextractorv1 import H5SortingExtractorV1, H5SortingExtractorV1Writer
from sortingview.serialize_wrapper import serialize_wrapper
import spikeextractors as se
from sortingview.config import job_cache, job_handler

from sortingview.extractors import LabboxEphysSortingExtractor
from ._correlograms_phy import compute_correlograms


@hi.function(
    'fetch_correlogram_plot_data', '0.2.7',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['sortingview']
)
@serialize_wrapper
def fetch_correlogram_plot_data(sorting_object, unit_x, unit_y=None):
    S = LabboxEphysSortingExtractor(sorting_object)
    data = _get_correlogram_data(sorting=S, unit_id1=unit_x, unit_id2=unit_y,
        window_size_msec=50, bin_size_msec=1)
    return data

def _get_time_segments(max_time: int, segment_size: int, num_segments: int):
    interval = np.floor(max_time / num_segments)
    start_times = [
        i * interval
        for i in range(num_segments)
    ]
    end_times = [
        i * interval + segment_size
        for i in range(num_segments)
    ]
    return start_times, end_times

@hi.function(
    'subsample_sorting', '0.1.5',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['sortingview']
)
def subsample_sorting(sorting_object: dict, segment_size_sec: float, num_segments: int):
    S = LabboxEphysSortingExtractor(sorting_object)
    segment_size = np.floor(S.get_sampling_frequency() * segment_size_sec)

    unit_ids = S.get_unit_ids()
    max_times = [np.max(S.get_unit_spike_train(unit_id)) for unit_id in unit_ids]
    max_time = np.floor(np.max(max_times))

    if max_time <= segment_size * num_segments * 2:
        return sorting_object
    
    segment_start_times, segment_end_times = _get_time_segments(max_time=max_time, segment_size=segment_size, num_segments=num_segments)
    with kc.TemporaryDirectory() as tmpdir:
        save_path = f'{tmpdir}/sorting.h5'
        W = H5SortingExtractorV1Writer(save_path=save_path, samplerate=S.get_sampling_frequency())
        for unit_id in unit_ids:
            st = S.get_unit_spike_train(unit_id)
            a = [st[(segment_start_times[i] <= st) & (st < segment_end_times[i])] for i in range(len(segment_start_times))]
            times_subsampled = np.concatenate(a)
            W.add_unit(unit_id=unit_id, times=times_subsampled)
        W.finalize()
        h5_path = kc.store_file(save_path)

    sorting_subsampled = LabboxEphysSortingExtractor({
        'sorting_format': 'h5_v1',
        'data': {
            'h5_path': h5_path
        }
    })
    return sorting_subsampled.object()

@kc.taskfunction('fetch_correlogram_plot_data.6', type='pure-calculation')
def task_fetch_correlogram_plot_data(*, sorting_object, unit_x, unit_y=None, subsample: bool):
    with hi.Config(
        job_cache=job_cache,
        job_handler=job_handler.correlograms
    ):
        with hi.Config(
            job_handler=job_handler.misc
        ):
            if subsample:
                sorting_object_subsampled = subsample_sorting.run(
                    sorting_object=sorting_object,
                    segment_size_sec=10,
                    num_segments=100
                )
            else:
                sorting_object_subsampled = sorting_object
        return fetch_correlogram_plot_data.run(
            sorting_object=sorting_object_subsampled,
            unit_x=unit_x,
            unit_y=unit_y
        )

def _get_spike_train(*, sorting: se.SortingExtractor, unit_id):
    if type(unit_id) == list:
        x = sorting.get_units_spike_train(unit_ids=unit_id)
        return np.sort(np.concatenate(x))
    else:
        return sorting.get_unit_spike_train(unit_id=unit_id)

def _get_correlogram_data(*, sorting, unit_id1, unit_id2=None, window_size_msec, bin_size_msec):
    auto = unit_id2 is None or unit_id2 == unit_id1

    times = _get_spike_train(sorting=sorting, unit_id=unit_id1)
    window_size = window_size_msec / 1000
    bin_size = bin_size_msec / 1000
    labels = np.ones(times.shape, dtype=np.int32)
    cluster_ids = [1]
    if not auto:
        times2 = _get_spike_train(sorting=sorting, unit_id=unit_id2)
        times = np.concatenate((times, times2))
        labels = np.concatenate((labels, np.ones(times2.shape, dtype=np.int32) *2 ))
        cluster_ids.append(2)
        inds = np.argsort(times)
        times = times[inds]
        labels = labels[inds]
    C = compute_correlograms(
        spike_times=times / sorting.get_sampling_frequency(),
        spike_clusters=labels,
        cluster_ids=cluster_ids,
        bin_size=bin_size,
        window_size=window_size,
        sample_rate=sorting.get_sampling_frequency(),
        symmetrize=True
    )
    bins = np.linspace(- window_size_msec / 2, window_size_msec / 2, C.shape[2])
    bin_counts = C[0, 0, :] if auto else C[0, 1, :]
    bin_size_sec = bin_size_msec / 1000
    return {
        'bins': bins.astype(np.float32),
        'bin_counts': bin_counts.astype(np.int32),
        'bin_size_sec': bin_size_sec
    }