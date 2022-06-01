import numpy as np
import spikeinterface as si
import kachery_cloud as kcl

from .get_sorting_object import get_sorting_object
from .copy_recording_extractor import _random_string
from .mdaio import writemda64
from .load_sorting_extractor import load_sorting_extractor


def copy_sorting_extractor(sorting: si.BaseSorting, *, upload_firings: bool=False):
    with kcl.TemporaryDirectory() as tmpdir:
        fname = tmpdir + '/' + _random_string(10) + '_firings.mda'
        write_firings_from_sorting(sorting=sorting, save_path=fname)
        # with ka.config(use_hard_links=True):
        if not upload_firings:
            uri = kcl.store_file_local(fname, label='firings.mda')
        else:
            uri = kcl.store_file(fname, label='firings.mda')
        sorting = load_sorting_extractor({
            'sorting_format': 'mda',
            'data': {
                'firings': uri,
                'samplerate': sorting.get_sampling_frequency()
            }
        })
        return sorting

def write_firings_from_sorting(sorting: si.BaseSorting, save_path):
    unit_ids = sorting.get_unit_ids()
    # if len(unit_ids) > 0:
    #     K = np.max(unit_ids)
    # else:
    #     K = 0
    times_list = []
    labels_list = []
    for i in range(len(unit_ids)):
        unit = unit_ids[i]
        times = sorting.get_unit_spike_train(unit_id=unit, segment_index=0)
        times_list.append(times)
        labels_list.append(np.ones(times.shape) * unit)
    all_times = _concatenate(times_list)
    all_labels = _concatenate(labels_list)
    sort_inds = np.argsort(all_times)
    all_times = all_times[sort_inds]
    all_labels = all_labels[sort_inds]
    L = len(all_times)
    firings = np.zeros((3, L))
    firings[1, :] = all_times
    firings[2, :] = all_labels
    writemda64(firings, save_path)

def _concatenate(list):
    if len(list) == 0:
        return np.array([])
    return np.concatenate(list)

def upload_sorting_extractor(sorting: si.BaseSorting, *, label: str):
    S = copy_sorting_extractor(sorting, upload_firings=True)
    obj = get_sorting_object(S)
    return kcl.store_json(obj, label=label)