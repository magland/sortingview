from typing import Dict, List, Union

import math
import numpy as np
import h5py

def _intersect_channel_ids(channel_ids_list: List[List[int]]):
    # from js:
    #   channel_ids_list is a list of the channel IDs that make up the neighborhood for each unit. This function will be passed a set of unit IDs that are to be merged, along with their respective channel neighborhoods. Its job is to reduce that list to only those channels in the neighborhood of each of the underlying units.
    #   It is assumed that there will be at least one channel common to all units being merged (so that x in line 10 never collapses to an empty list); violating this assumption leads to failure of the function.
    #   inds will actually wind up being a list of lists--the per-unit-neighborhood indices of the channels in the consolidated/fully intersected set of channels. Like the input channel_ids_list, its outermost index will be the units, so the channel indices can always be mapped back to the units whose neighborhoods they're identifiying.
    
    x = channel_ids_list[0]
    for y in channel_ids_list:
        x = np.intersect1d(x, y).tolist()
    inds = []
    for y in channel_ids_list:
        a, inds_x, inds_y = np.intersect1d(x, y, return_indices=True)
        inds.append(inds_y.tolist())
    return x, inds

def _get_unit_waveforms_from_list_from_snippets_h5(snippets_h5_path: str, unit_ids: List[int], max_num_events: int = None):
    unit_waveforms_list = []
    unit_waveforms_channel_ids_list = []
    channel_locations_list = []
    sampling_frequency_list = []
    unit_spike_train_list = []
    for unit_id in unit_ids:
        unit_waveforms0, unit_waveforms_channel_ids0, channel_locations0, sampling_frequency0, unit_spike_train0 = get_unit_waveforms_from_snippets_h5(snippets_h5_path, unit_id, max_num_events=max_num_events)
        unit_waveforms_list.append(unit_waveforms0)
        unit_waveforms_channel_ids_list.append(unit_waveforms_channel_ids0)
        channel_locations_list.append(channel_locations0)
        sampling_frequency_list.append(sampling_frequency0)
        unit_spike_train_list.append(unit_spike_train0)
    intersection_channel_ids, inds = _intersect_channel_ids(unit_waveforms_channel_ids_list)
    for i in range(len(unit_ids)):
        unit_waveforms_list[i] = unit_waveforms_list[i][:, inds[i]]
        unit_waveforms_channel_ids_list[i] = intersection_channel_ids
        channel_locations_list[i] = channel_locations_list[i][inds[i]]
    unit_waveforms = np.concatenate(unit_waveforms_list, axis=0)
    unit_spike_train = np.concatenate(unit_spike_train_list)
    return unit_waveforms, np.array(intersection_channel_ids), channel_locations_list[0], sampling_frequency_list[0], unit_spike_train

def subsample_inds(n, m):
    if m >= n:
        return range(n)
    incr = n / m
    return [int(math.floor(i * incr)) for i in range(m)]

def get_unit_waveforms_from_snippets_h5(snippets_h5_path: str, unit_id: Union[int, List[int]], max_num_events: int = None):
    if type(unit_id) is list:
        return _get_unit_waveforms_from_list_from_snippets_h5(snippets_h5_path, unit_id, max_num_events=max_num_events)
    with h5py.File(snippets_h5_path, 'r') as f:
        channel_ids = np.array(f.get('channel_ids'))
        channel_locations = np.array(f.get(f'channel_locations'))
        unit_spike_train = np.array(f.get(f'unit_spike_trains/{unit_id}'))
        sampling_frequency = np.array(f.get('sampling_frequency'))[0].item()
        if np.isnan(sampling_frequency):
            print('WARNING: sampling frequency is nan. Using 30000 for now. Please correct the snippets file.')
            sampling_frequency = 30000
        unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms'))
        unit_waveforms_channel_ids = np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids'))

        if max_num_events is not None:
            if len(unit_spike_train) > max_num_events:
                inds = subsample_inds(len(unit_spike_train), max_num_events)
                unit_spike_train = unit_spike_train[inds]
                unit_waveforms = unit_waveforms[inds]

    channel_locations0 = []
    for ch_id in unit_waveforms_channel_ids:
        ind = np.where(channel_ids == ch_id)[0]
        channel_locations0.append(channel_locations[ind, :].ravel().tolist())
    
    return unit_waveforms, unit_waveforms_channel_ids, np.array(channel_locations0), sampling_frequency, unit_spike_train
